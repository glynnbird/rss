<script setup>
  const auth = useAuth()
  const articles = ref(0)
  articles.value = []
  const feeds = ref(1)
  feeds.value = []

  // config
  const config = useRuntimeConfig()
  const apiHome = config.public['apiBase'] || window.location.origin
  let req

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
    articles.value.sort(sorter)

    // delete articles older than a month
    const oneMonthAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 30
    const oneMonthAgoTS = new Date(oneMonthAgo).toISOString()
    console.log('culling articles oldert than', oneMonthAgoTS)
    for (let j = 0; j < articles.value.length; j++) {
      if (articles.value[j].pubDate < oneMonthAgoTS) {
        // delete all subsequent articles
        articles.value.splice(j, Infinity)
        break
      }
    }

    // store our articles in localStorage
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles.value))

    // go through the articles again
    for (let j = 0; j < articles.value.length; j++) {

      // add a new flag to articles that are newer
      if (articles.value[j].pubDate > since) {
        // delete all subsequent articles
        articles.value[j].new = true
      }

      // add ago field
      articles.value[j].ago = timeAgo.format(new Date(articles.value[j].pubDate), 'mini')
    }

    return articles.value
  })

  // get items from localStorage
  const ARTICLES_KEY = 'articles'
  const ls = localStorage.getItem(ARTICLES_KEY)
  if (ls) {
    articles.value = JSON.parse(ls)
    console.log('got articles from localStorage')
  }

  // get last polled date from local storage
  const SINCE_KEY = 'since'
  const since = localStorage.getItem(SINCE_KEY) || '1970-01-01T00:00:00.000Z'
  console.log('Last polled', since)

  // flag indicating whether we're making an API call
  const busy = ref(2)
  busy.value = false

  // merge the incoming articles into the existing data set
  const addArticles = (newArticles) => {
    console.log('new batch of articles', newArticles.length)
    let newCount = 0
    // only add articles we don't already have
    for(let i = 0; i < newArticles.length; i++) {
      let found = false
      for (let j = 0; i < articles.value.length; j++) {
        if (articles.value[j].id === newArticles[i].id) {
          found = true
          break
        }
      }
      if (!found) {
        articles.value.push(newArticles[i])
        newCount++
      }
    }
    console.log('net new', newCount)
  }

  const fetchArticles = async () => {
    // we're busy
    busy.value = true
    let articleid
    const newSince = new Date().toISOString()

    // make a note of the current newest article
    if (articles.value.length > 0) {
      articleid = articles.value[0].articleid
    }

    // get a list of feeds
    console.log('API', '/list', `${apiHome}/api/list`)
    req = await useFetch(`${apiHome}/api/list`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        apikey: auth.value.apiKey
      }
    })
    feeds.value = req.data.value.list

    // build the work array
    const work = []
    const workerClosure = (f) => {
      console.log('wokerClosure', JSON.stringify(f))
      return async () => {
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
        addArticles(req.data.value.feed)
      }
    }
    for (let i = 0; i < feeds.value.length; i++) {
      work.push(workerClosure(feeds.value[i])())
    }
    
    // wait for all the feeds to return
    await Promise.all(work)

    // // store last polled date in localstorage
    localStorage.setItem(SINCE_KEY, newSince)
    
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
  <v-progress-linear v-if="busy" indeterminate></v-progress-linear>

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
      :src="article.media"
      lazy-src="/lazy.jpg"
      cover
    ></v-img>
  </v-card>
</template>
