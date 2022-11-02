<template>
  <ArticleList 
    :articles="articles"
    :favourites="favourites"
    :busy="busy"
    :dividerId="dividerId"
    middleLink="newsfeed"
    middleLabel="News"
  />
</template>

<script>

export default {
  data: function () {
    return {
      busy: false,
      favourites: {},
      dividerId: null
    };
  },
  async asyncData({ redirect, store, $axios }) {
    // load recent article list from local storage (profile)
    const profile = store.state.profile.profile;
    if (!profile) {
      //not logged in so bounce to home page
      redirect('/')
      return
    }
    store.commit('page/setTitle', 'Favourites')
    const favourites = profile.favourites ? profile.favourites : {}
    return { favourites }
  },
  computed: {
    articles () {
      function compareFn(a, b) {
        if (a.timestamp < b.timestamp) {
          return 1
        } else if (a.timestamp > b.timestamp) {
          return -1
        }
        return 0
      }
      return Object.values(this.favourites).sort(compareFn)
    }
  }
}
</script>
