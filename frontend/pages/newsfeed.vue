<template>
  <div>
    <v-progress-linear
      v-if="busy"
        indeterminate
        color="teal"
      ></v-progress-linear>
    <v-list two-line flat>
      <v-list-item
        v-bind:key="article.articleid"
        v-for="article in articlesAgo"
        :href="article.link"
        target="_new"
      >
        <v-list-item-avatar>
          <img :src="article.icon" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-html="article.title"></v-list-item-title>
          <v-list-item-subtitle
            v-html="article.content"
          ></v-list-item-subtitle>
          <v-list-item-subtitle >
            <span class="evensmaller">{{ article.ago }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<style>
.evensmaller {
  font-size:10px
}
.v-list-item__title, .v-list-item__subtitle {
    flex: 1 1 100%;
    white-space: unset !important
    /* overflow: hidden; */
    /* text-overflow: ellipsis; */
    /* white-space: nowrap; */
}
</style>

<script>
import localstorage from "~/assets/js/localstorage";
const config = require("../config.json");

// tools for converting ISO timestamps to "3 days ago"-style
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-GB')

export default {
  data: function () {
    return {
      timer: 0,
      busy: false,
      articles: [],
    };
  },  
  mounted: async function() {
    // indicate that we're busy 
    this.busy = true

    // fetch newest news from the API
    const profile = this.$store.state.profile.profile;
    console.log("asyncdata profile is", profile);
    const url = `${config.articlesFunctionUrl.value}?apikey=${profile.apikey}`;
    let articles = await this.$axios.$get(url);
    this.articles = articles

    // save recent articles to localstorage for faster load next time
    const prof = JSON.parse(JSON.stringify(profile))
    prof.articles = articles
    localstorage.saveProfile(prof);
    
    // stop busy indicator
    this.busy = false

    // increment the timer every second - to force the computed function to recalculate
    setInterval(() => { this.timer++ }, 1000)
  },
  async asyncData({ redirect, store, $axios }) {
    // load recent article list from local storage (profile)
    const profile = store.state.profile.profile;
    if (!profile) {
      //not logged in so bounce to home page
      redirect('/')
      return
    }
    let articles = profile.articles ? profile.articles : []
    return { articles }
  },
  computed: {
    articlesAgo () {
      // this line does nothing but fools Vue.js into thinking that
      // this computed element depends on this.timer, so it gets
      // run every second - so the "ago" timings get updated as the page sits.
      this.timer

      // add "ago"-style date to each article
      return this.articles.map((a) => {
        a.ago = timeAgo.format(new Date(a.timestamp))
        return a
      })
    }
  },

  methods: {},
}
</script>
