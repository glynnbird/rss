<template>
  <div>
    <v-card outlined>
      <v-card-title>Your Feeds</v-card-title>
      <v-card-text>
        <v-list-item :key="feed.feedid" v-for="feed in feeds"        >
          <v-list-item-avatar>
            <v-img :src="feed.icon" max-height="50"> </v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ feed.feed_name }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ feed.link}} {{feed.timestamp}}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn @click="deleteFeed (feed.feedid)"> 
              <v-icon color="light-blue darken-3"> mdi-delete </v-icon> 
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-card-text>
    </v-card>
  </div>
</template>


<script>
const config = require("../config.json");
export default {
  data: function () {
    return {
      feeds: [],
    };
  },
  async asyncData({ store, $axios }) {
    const profile = store.state.profile.profile;
    console.log("asyncdata profile is", profile);
    const url = `${config.getAllFeedsFunctionUrl.value}?apikey=${profile.apikey}`;
    const feeds = await $axios.$get(url);
    console.log(feeds);

    return { feeds: feeds.feeds };
  },

  methods: {
    deleteFeed: async function (feedid) {
      //console.log(feedid)
      const profile = this.$store.state.profile.profile;
      const url = `${config.deleteFeedFunctionUrl.value}?apikey=${profile.apikey}&feedid=${feedid}`;
      const articles = await this.$axios.$get(url);
      console.log("feed deleted!");
      //now remove the deleted feed from the list of feeds so that it disappears from the UI
      this.feeds = this.feeds.filter(function (feed) {
        return feed.feedid != feedid;
      });
      this.$router.push("/showfeeds");
    },
  },
};
</script>
