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

  const calculateAgo = function() {
    for (let j = 0; j < articles.value.length; j++) {
      articles.value[j].ago = timeAgo.format(new Date(articles.value[j].timestamp), 'mini')
    }
  }

  // get items from localStorage
  const ARTICLES_KEY = 'articles'
  const ls = localStorage.getItem(ARTICLES_KEY)
  if (ls) {
    articles.value = JSON.parse(ls)
    console.log('got articles from localStorage')
  }

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

    for (let i = 0; i < feeds.value.length; i++) {
      console.log('API', '/poll', `${apiHome}/api/poll`, feeds.value[i].feed_name)
      req = await useFetch(`${apiHome}/api/poll`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          apikey: auth.value.apiKey
        },
        body: JSON.stringify({ id: feeds.value[i].id })

      })
      addArticles(req.data.value.feed)
    }
    // // make the API call
    // const url = 'https://n2gyw7qpcf6kyvkobval7o5geq0dpbiy.lambda-url.eu-west-1.on.aws/?apikey=' + auth.value.apiKey
    // const { data } = await useFetch(url)
    // articles.value = data.value

    // // mark the new articles as "new"
    // for(let i = 0; i < articles.value.length; i++) {
    //   const a = articles.value[i]
    //   if (articleid && a.articleid !== articleid) {
    //     articles.value[i].new = true
    //   } else {
    //     break
    //   }
    // }

    // // store articles in localstorage
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles.value))

    // calculate age of articles
    calculateAgo()
    
    // not busy
    busy.value = false
  }

  // fetch the articles
  setTimeout(async () => {
    // run the API fetch in the background
    await fetchArticles()

  }, 1)
  // recalculate "ago" every minute
  setInterval(() => {
    calculateAgo()
  }, 1000 * 60)

  // recalculate ago on page load
  calculateAgo()

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

  {{ feeds }}
  <!-- list of articles -->
  <v-card v-for="article in articles"
    class="mx-auto"
    :href="article.link"
    max-width="640"
    target="_new"
    :ripple="false"
  >
    <v-card-item>
      <v-card-title>
        <v-avatar size="18px" style="margin-right:5px">
          <v-img v-if="article.icon" alt="Avatar" :src="article.icon"></v-img>
          <v-icon v-else></v-icon>
        </v-avatar>
        <v-icon size="small" color="blue" v-if="article.new">mdi-new-box</v-icon>
        <v-chip size="x-small">{{ article.ago}}</v-chip>
        {{ article.title }}
      </v-card-title>
      <v-card-subtitle>
        {{  article.content }}
      </v-card-subtitle>
    </v-card-item>
    <v-img v-if="article.media"
      :src="article.media"
      lazy-src="/lazy.jpg"
      cover
    ></v-img>
  </v-card>
</template>
