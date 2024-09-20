<script setup>
  const auth = useAuth()
  const articles = ref(0)
  articles.value = []

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
  const busy = ref(1)
  busy.value = false

  const fetchArticles = async () => {
    // we're busy
    busy.value = true
    let articleid

    // make a note of the current newest article
    if (articles.value.length > 0) {
      articleid = articles.value[0].articleid
    }

    // make the API call
    const url = 'https://nucx5di6gfl63ngdpr4sehcrbi0yzaao.lambda-url.eu-west-1.on.aws?apikey=' + auth.value.apiKey
    const { data } = await useFetch(url)
    articles.value = data.value

    // mark the new articles as "new"
    for(let i = 0; i < articles.value.length; i++) {
      const a = articles.value[i]
      if (articleid && a.articleid !== articleid) {
        articles.value[i].new = true
      } else {
        break
      }
    }

    // store articles in localstorage
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles.value))

    // not busy
    busy.value = false
  }

  // fetch the articles
  setTimeout(async () => {
    // run the API fetch in the background
    await fetchArticles()
    calculateAgo()
  }, 10)
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
        <v-avatar size="18px">
          <v-img v-if="article.icon" alt="Avatar" :src="article.icon"></v-img>
          <v-icon v-else></v-icon>
        </v-avatar>
        <v-icon size="small" color="blue" v-if="article.new">mdi-new-box</v-icon>
        {{ article.title }} <v-chip size="x-small">{{ article.ago}}</v-chip>
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
