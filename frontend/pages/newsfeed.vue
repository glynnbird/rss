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
        v-for="article in articles"
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
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>


<script>
import localstorage from "~/assets/js/localstorage";
const config = require("../config.json");
export default {
  data: function () {
    return {
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
    articles = articles.map((a) => {
      const c = a.content.replace(/(<\/[^>]+>)/,"$1\n")
      const lines = c.split("\n")
      a.content = lines[0]
      return a
    })
    this.articles = articles

    // save recent articles to localstorage for faster load next time
    const prof = JSON.parse(JSON.stringify(profile))
    prof.articles = articles
    localstorage.saveProfile(prof);
    
    // stop busy indicator
    this.busy = false
  },
  async asyncData({ store, $axios }) {
    // load recent article list from local storage (profile)
    const profile = store.state.profile.profile;
    const articles = profile.articles ? profile.articles : []
    return { articles }
  },

  methods: {},
};
</script>
