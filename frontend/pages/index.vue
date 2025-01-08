<script setup>
  const auth = useAuth()
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
    const fourDaysAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 4
    const fourDaysAgoTS = new Date(fourDaysAgo).toISOString()
    console.log('culling articles older than', fourDaysAgoTS)
    for (let j = 0; j < clonedArticles.length; j++) {
      if (clonedArticles[j].pubDate < fourDaysAgoTS) {
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
    req = await useFetch(`${apiHome}/api/list`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        apikey: auth.value.apiKey
      }
    })
    feeds.value = req.data.value.list
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
      req = await useFetch(`${apiHome}/api/poll`, {
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
      if (req && req.data && req.data.value) {
        const ids = addArticles(req.data.value.feed)
        netNewIds = netNewIds.concat(ids)
      }
      pollingProgress.value++
    }

    // store last polled date in localstorage
    localStorage.setItem(SINCE_KEY, newSince)

    // poll each new item's url to fetch a good image
    // console.log('fetching images for new articles', netNewIds)
    // for(const id of netNewIds) {
    //   let article = null
    //   for(let i = 0 ; i < articles.value.length; i++) {
    //     if (articles.value[i].guid === id) {
    //       article = articles.value[i]
    //       break
    //     }
    //   }
    //   if (article) {
    //     console.log('API', '/poll', `${apiHome}/api/image`, article.link)
    //     req = await useFetch(`${apiHome}/api/image`, {
    //       method: 'post',
    //       headers: {
    //         'content-type': 'application/json',
    //         apikey: auth.value.apiKey
    //       },
    //       body: JSON.stringify({ 
    //         url: article.link
    //       })
    //     })
    //     if (req && req.data && req.data.value) {
    //       console.log('response', req.data.value)
    //       article.media = req.data.value.image
    //       article.title = '! '+ article.title
    //     }
    //   }
    // }
    
    // not busy
    busy.value = false
  }

  // fetch the articles
  setTimeout(async () => {
    // run the API fetch in the background
    await fetchArticles()
  }, 1)

</script>
<style setup>
.v-card {
  margin-bottom: 20px;
}
.v-card-title, .v-card-subtitle {
  flex: 1 1 100%;
  white-space: unset !important;

}
.v-card-title {
  font-size:18px;
  line-height: 1.6rem !important;
}
.v-card-subtitle {
  font-size:16px;
}
.card-divider {
  border-bottom: 3px dashed #aaa
}
</style>
<template>
  <!-- busy indicator-->
  <v-progress-linear v-if="busy" :model-value="pollingProgress" :max="feeds.length"></v-progress-linear>

  <!-- list of articles -->
  <v-card v-for="article in timeOrderedArticles"
    class="mx-auto"
    :href="article.link"
    max-width="640"
    target="_new"
    :ripple="false"
  >
    <v-card-item>
      <v-card-title>
        <v-icon size="small" color="blue" v-if="article.new">mdi-new-box</v-icon>
        <v-chip size="x-small">{{ article.ago}}</v-chip>
        {{ article.title }}
      </v-card-title>
      <v-card-subtitle>
        <div v-html="article.description"></div>
      </v-card-subtitle>
    </v-card-item>
    <v-img v-if="article.media"
      :src="`${apiHome}/api/image?url=${article.link}`"
      :lazy-src="article.media"
      cover
    ></v-img>
  </v-card>
</template>
