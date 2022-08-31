<template>
  <ArticleList 
    :articles="articles"
    :favourites="favourites"
    :busy="busy"
    :dividerId="dividerId"
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
    const favourites = profile.favourites ? profile.favourites : {}
    return { favourites }
  },
  computed: {
    articles () {
      return  Object.values(this.favourites)
    }
  }
}
</script>
