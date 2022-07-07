<template>
  <div>
    Your articles
    <v-card outlined v-bind:key="article.articleid" v-for="article in articles">
      <v-card-title>{{ article.title }}</v-card-title>
      <v-card-text v-html="article.content"> </v-card-text>
      <v-card-actions>
        <v-btn :href="article.link" target="_new"
          color="deep-purple lighten-2"
          text
        >
          Read
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>


<script>
const config = require("../config.json");
export default {
  data: function () {
    return {
      articles: [],
    };
  },
  async asyncData({ store, $axios }) {
    const profile = store.state.profile.profile;
    console.log("asyncdata profile is", profile);
    const url = `${config.articlesFunctionUrl.value}?apikey=${profile.apikey}`;
    const articles = await $axios.$get(url);
    //console.log(articles)

    return { articles };
  },

  methods: {},
};
</script>
