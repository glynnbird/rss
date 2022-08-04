<template>
  <div>
    Your articles
    <v-list two-line>
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
