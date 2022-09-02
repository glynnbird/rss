<template>
  <div>
    <v-progress-linear v-if="busy" indeterminate></v-progress-linear>
    <v-list two-line flat dense>
      <v-list-item :key="feed.feedid" v-for="feed in feeds">
        <v-list-item-avatar>
          <v-img :src="feed.icon" max-height="50"> </v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            <v-icon v-if="feed.feed_type && feed.feed_type === 'twitter'">mdi-twitter</v-icon>
            <v-icon v-if="!feed.feed_type || feed.feed_type === 'rss'">mdi-rss</v-icon>
            {{ feed.feed_name }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ feed.link }} {{ feed.timestamp }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon @click="deleteFeed(feed.feedid)">
            <v-icon color="light-blue darken-3"> mdi-delete </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <br />
    <v-btn nuxt to="addfeed" color="primary">Add Feed</v-btn>
  </div>
</template>


<script>
const config = require("../config.json");
export default {
  data: function () {
    return {
      busy: true,
      feeds: [],
    };
  },
  async asyncData({ redirect, store }) {
    // load feed lsit from local storage (profile)
    const profile = store.state.profile.profile;
    if (!profile) {
      //not logged in so bounce to home page
      redirect('/')
      return
    }
    store.commit('page/setTitle', 'Feeds')
    const feeds = profile.feeds ? profile.feeds : []
    return { feeds }
  },
  mounted: async function () {
    // show we're busy
    this.busy = true

    // fetch feed list from API
    const profile = this.$store.state.profile.profile;
    const url = `${config.getAllFeedsFunctionUrl.value}?apikey=${profile.apikey}`;
    const feeds = await this.$axios.$get(url);

    // store in profile for faster loading
    this.$store.commit('profile/newFeeds', feeds.feeds)
    this.feeds = this.$store.state.profile.profile.feeds

    // clear busy indicator
    this.busy = false
  },
  methods: {
    deleteFeed: async function (feedid) {
      // delete a feed using the API
      const profile = this.$store.state.profile.profile;
      const url = `${config.deleteFeedFunctionUrl.value}?apikey=${profile.apikey}&feedid=${feedid}`;
      const articles = await this.$axios.$get(url);

      // now remove the deleted feed from the list of feeds so that it disappears from the UI
      this.$store.commit('profile/deleteFeed', feedid)
    },
  },
};
</script>
