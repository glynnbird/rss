<script setup>
  const { $pwa } = useNuxtApp()
  const auth = useAuth()
  const count = useArticleCount()
  const articles = ref([])
  const feeds = ref([])
  const pollingProgress = ref(0)

  // config
  const config = useRuntimeConfig()
  const apiHome = config.public['apiBase'] || window.location.origin
  let req

  // localStorage keys
  const ARTICLES_KEY = 'articles'
  const SINCE_KEY = 'since'
  const FEEDS_KEY = 'feeds'

  // time ago library
  import TimeAgo from 'javascript-time-ago'
  import en from 'javascript-time-ago/locale/en'
  TimeAgo.addDefaultLocale(en)
  const timeAgo = new TimeAgo('en-GB')

  // display the 
  const timeOrderedArticles = computed(() => {
    const sorter = function (a, b) {
      if (a.pubDate < b.pubDate) {
        return 1
      } else if (a.pubDate > b.pubDate) {
        return -1
      } else {
        return 0
      }
    }

    // sort the articles
    const clonedArticles = JSON.parse(JSON.stringify(articles.value))
    clonedArticles.sort(sorter)

    // delete articles older than a 4 days
    const oneDaysAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 1
    const oneDaysAgoTS = new Date(oneDaysAgo).toISOString()
    console.log('culling articles older than', oneDaysAgoTS)
    for (let j = 0; j < clonedArticles.length; j++) {
      if (clonedArticles[j].pubDate < oneDaysAgoTS) {
        // delete all subsequent articles
        clonedArticles.splice(j, Infinity)
        break
      }
    }

    // store our articles in localStorage
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(clonedArticles))

    // go through the articles again
    for (let j = 0; j < clonedArticles.length; j++) {

      // add a new flag to articles that are newer
      if (clonedArticles[j].pubDate > since) {
        // delete all subsequent articles
        clonedArticles[j].new = true
      }

      // add ago field
      clonedArticles[j].ago = timeAgo.format(new Date(clonedArticles[j].pubDate), 'mini')
    }

    // count of articles
    count.value = clonedArticles.length

    return clonedArticles
  })

  // get items from localStorage
  let ls = localStorage.getItem(ARTICLES_KEY)
  if (ls) {
    articles.value = JSON.parse(ls)
    console.log('got articles from localStorage')
  }

  // get last polled date from local storage
  const since = localStorage.getItem(SINCE_KEY) || '1970-01-01T00:00:00.000Z'
  console.log('Last polled', since)

  // get last known feeds list
  ls = localStorage.getItem(FEEDS_KEY)
  feeds.value = ls ? JSON.parse(ls) : []
  console.log('cached feeds', feeds.value)

  // flag indicating whether we're making an API call
  const busy = ref(false)
  const pollingImages = ref(false)

  // merge the incoming articles into the existing data set
  const addArticles = (newArticles) => {
    console.log('new batch of articles', newArticles.length)
    let newCount = 0
    const ids = []
    // only add articles we don't already have
    for(let i = 0; i < newArticles.length; i++) {
      let found = false
      for (let j = 0; i < articles.value.length; j++) {
        if (!articles.value[j]) {
          break
        }
        if (articles.value[j].guid === newArticles[i].guid) {
          found = true
          break
        }
      }
      if (!found) {
        articles.value.push(newArticles[i])
        ids.push(newArticles[i].guid)
        newCount++
      }
    }
    console.log('net new', newCount)
    return ids
  }

  // get a list of RSS feeds from the API
  const fetchFeeds = async () => {
    console.log('API', '/list', `${apiHome}/api/list`)
    req = await $fetch(`${apiHome}/api/list`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        apikey: auth.value.apiKey
      }
    })
    feeds.value = req.list
    localStorage.setItem(FEEDS_KEY, JSON.stringify(feeds.value))
  }

  // fetch all the latest news by polling each news feed
  const fetchArticles = async () => {
    // we're busy
    busy.value = true
    let articleid
    const newSince = new Date().toISOString()
    pollingProgress.value = 0

    // make a note of the current newest article
    if (articles.value.length > 0) {
      articleid = articles.value[0].articleid
    }

    // get a list of feeds
    if (feeds.value.length === 0) {
      // if we've no feeds fetch them now
      console.log('fetching feeds for the first time')
      await fetchFeeds()
    } else {
      // do it in the background
      setTimeout(async () => {
        // fetch the feeds in the background
        console.log('fetching feeds in the background')
        await fetchFeeds()
      }, 1)
    }

    // poll the feeds, one at a time
    let netNewIds = []
    for (let i = 0; i < feeds.value.length; i++) {
      const f = feeds.value[i]
      console.log('API', '/poll', `${apiHome}/api/poll`, f.feed_name)
      req = await $fetch(`${apiHome}/api/poll`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          apikey: auth.value.apiKey
        },
        body: JSON.stringify({ 
          id: f.id,
          since
        })
      })
      if (req) {
        const ids = addArticles(req.feed)
        netNewIds = netNewIds.concat(ids)
      }
      pollingProgress.value++
    }

    // not busy, but polling images
    busy.value = false
    pollingImages.value = true

    // store last polled date in localstorage
    localStorage.setItem(SINCE_KEY, newSince)

    // fetch better images for new articles
    console.log('polling for better images', articles.value.length, 'articles')
    for (let i = 0 ; i < articles.value.length;  i++) {
      const article = articles.value[i]

      if (!article.polled) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 1000)
          req = await $fetch(`${apiHome}/api/image`, {
            method: 'post',
            headers: {
              'content-type': 'application/json',
              apikey: auth.value.apiKey
            },
            body: JSON.stringify({ 
              url: article.link
            }),
            signal: controller.signal
          })
          clearInterval(timeoutId)
          if (req && req.url) {
            articles.value[i].media = req.url
          }
        } catch (e) {
          console.error('Failed to get image for', article.link, e)
        }
      }
      articles.value[i].polled = true
    }

    // // finished polling images
    pollingImages.value = false
  }

  const extractSource = (s) => {
    const u = new URL(s)
    const h = u.hostname.split('.')
    return h.slice(h.length - 2).join('.')
  }

  // fetch the articles
  setTimeout(async () => {
    // run the API fetch in the background
    await fetchArticles()
  }, 1)

</script>
<style setup>
.title {
  font-size: 16px;
  overflow:visible !important;
  white-space: unset !important;
}
.sep {
  margin-right:10px;
}
.cardsep {
  margin-top: 10px;
  margin-bottom:10px; 
}
.offbot {
  margin-bottom: 10px;
}
.space {
  margin-top: 10px;
  margin-bottom: 10px;
}
.newsimg {
  min-height: 191px;
}
</style>
<template>
  <!-- pwa update indicator -->
  <v-alert color="warning" v-show="$pwa.needRefresh">
    <h4> New content available, click on reload button to update. </h4>
    <v-btn color="primary" @click="$pwa.updateServiceWorker()">Reload</v-btn>
  </v-alert>

  <!-- busy indicator-->
  <v-progress-linear v-if="busy" :model-value="pollingProgress" :max="feeds.length"></v-progress-linear>
  <v-progress-linear v-if="pollingImages" color="yellow-darken-2" indeterminate></v-progress-linear>
  
  <!-- list of articles -->
  <v-card v-for="article in timeOrderedArticles"
    class="mx-auto cardsep"
    :href="article.link"
    max-width="640"
    target="_new"
    :ripple="false"
  >
    <!-- lazy-src="/lazy.jpg" --> 
    <v-img v-if="article.media" :src="article.media" cover class="newsimg" />
    <v-card-title class="title">
      <v-icon size="default" color="blue" v-if="article.new">mdi-new-box</v-icon>
      {{ article.title }}
    </v-card-title>
    <v-card-subtitle>
      {{ extractSource(article.link) }} - {{ article.ago}}
    </v-card-subtitle>
  </v-card>
</template>
