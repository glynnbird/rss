import Vue from "vue";
import localstorage from "~/assets/js/localstorage";

export const state = () => ({
  profile: null
})

export const mutations = {
  save(state, obj) {
    state.profile = obj  
    console.log("profile inserted ") 
  },
  newArticles(state, articles) {
    state.profile.articles = articles
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
  }
}
  