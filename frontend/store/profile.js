import Vue from "vue";
import localstorage from "~/assets/js/localstorage";

export const state = () => ({
  profile: null
})

export const mutations = {
  save(state, obj) {
    state.profile = obj  
  },
  saveAPIKey(state, apikey) {
    state.profile = {}
    state.profile.apikey = apikey
    localstorage.saveProfile(state.profile)
  },
  newArticles(state, articles) {
    state.profile.articles = articles
    localstorage.saveProfile(state.profile)
  },
  addFavourite(state, article) {
    state.profile.favourites = state.profile.favourites || {}
    Vue.set(state.profile.favourites, article.articleid, article)
    localstorage.saveProfile(state.profile)
  },
  deleteFavourite(state, article) {
    state.profile.favourites = state.profile.favourites || {}
    Vue.delete(state.profile.favourites, article.articleid)
    localstorage.saveProfile(state.profile)
  },
  newFeeds(state, feeds) {
    state.profile.feeds = feeds
    localstorage.saveProfile(state.profile)
  },
  deleteFeed(state, feedid) {
    for (let i = 0; i < state.profile.feeds.length ; i++) {
      const feed = state.profile.feeds[i]
      if (feed.feedid === feedid) {
        Vue.delete(state.profile.feeds, i)
        break
      }
    }
    localstorage.saveProfile(state.profile)
  },
  zoom(state) {
    //console.log('zoom', state.profile)
    if (typeof state.profile.zoom === 'undefined') {
      state.profile.zoom = false
    }
    state.profile.zoom = !state.profile.zoom
    localstorage.saveProfile(state.profile)
  }
}
  