<template>
  <ArticleList 
    :articles="articles"
    :favourites="favourites"
    :busy="busy"
    :dividerId="dividerId"
    middleLink="favourites"
    middleLabel="Favourites"
  />
</template>

<script>
const config = require("../config.json");

export default {
  data: function () {
    return {
      busy: false,
      articles: [],
      favourites: {},
      dividerId: null
    };
  },  
  mounted: async function() {
    // indicate that we're busy 
    this.busy = true

    // make a note of the id of the current newest article
    let articleid = null
    if (this.articles.length > 0) {
      articleid = this.articles[0].articleid
    }

    // fetch newest news from the API
    const profile = this.$store.state.profile.profile;
    const url = `${config.articlesFunctionUrl.value}?apikey=${profile.apikey}`;
    const articles = await this.$axios.$get(url);

    // mark the oldest of the new ones (so that it gets highlighted on the page)
    if (articleid) {
      for(let i =0 ; i < articles.length; i++) {
        const article = articles[i]
        if (article.articleid === articleid && i > 0) {
          this.dividerId = articles[i - 1].articleid
          break
        }
      }
    }

    // save recent articles to localstorage for faster load next time
    this.$store.commit('profile/newArticles', articles)
    this.articles = this.$store.state.profile.profile.articles
    
    // stop busy indicator
    this.busy = false
  },
  async asyncData({ redirect, store, $axios }) {
    // load recent article list from local storage (profile)
    const profile = store.state.profile.profile;
    if (!profile) {
      //not logged in so bounce to home page
      redirect('/')
      return
    }
    store.commit('page/setTitle', 'News')
    const articles = profile.articles ? profile.articles : []
    const favourites = profile.favourites ? profile.favourites : {}
    return { articles, favourites }
  },
}
</script>
