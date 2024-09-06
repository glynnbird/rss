<script setup>
  const router = useRouter()
  const color = useColor() 
  const auth = useAuth()
  const articles = ref(0)
  articles.value = []

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

  // marks the divide between new and old articles
  const dividerId = ref(2)
  dividerId.value = null

  // marks the date that divides new and old articles
  const dateOfDivider = ref(3)
  dateOfDivider.value = null

  const fetchArticles = async () => {
    // we're busy
    busy.value = true
 
    // make a note of the id of the current newest article
    let articleid = null
    if (articles.value.length > 0) {
      articleid = articles.value[0].articleid
    }

    // make the API call
    const url = 'https://nucx5di6gfl63ngdpr4sehcrbi0yzaao.lambda-url.eu-west-1.on.aws?apikey=' + auth.value.apiKey
    const { data } = await useFetch(url)
    articles.value = data.value

    // store articles in localstorage
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles.value))

    // mark the oldest of the new ones (so that it gets highlighted on the page)
    if (articleid) {
      for(let i =0 ; i < articles.value.length; i++) {
        const article = articles.value[i]
        if (article.articleid === articleid && i > 0) {
          dividerId.value = articles[i - 1].articleid
          if (i < articles.value.length - 1) {
            dateOfDivider.value = articles.value[i + 1].timestamp
          }
          break
        }
      }
    }

    // not busy
    busy.value = false
  }

  // fetch the articles
  setTimeout(async () => {
    // run the API fetch in the background
    await fetchArticles()
  }, 200)

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
  line-height: 1.3rem !important;
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
    rel="noopener"
    target="_new"
  >
    <v-card-title>
      <v-avatar size="18px">
        <v-img v-if="article.icon" alt="Avatar" :src="article.icon"></v-img>
        <v-icon v-else></v-icon>
      </v-avatar>
      <!-- new icon - only for articles newer than the dividing line -->
      <v-icon color="blue" v-if="dateOfDivider && article.timestamp >= dateOfDivider">mdi-new-box</v-icon>
      {{ article.title }}
    </v-card-title>
    <v-card-subtitle>
      {{  article.content }}
    </v-card-subtitle>
    <v-img v-if="article.media"
      height="200px"
      :src="article.media"
      cover
    ></v-img>
  </v-card>
</template>
