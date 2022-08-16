<template>
  <div>
    <v-progress-linear
      v-if="busy"
      indeterminate
      color="teal">
    </v-progress-linear>
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
    <br />
    <v-btn nuxt to="addfeed" color="primary">Add Feed</v-btn>
  </div>
</template>


<script>
import localstorage from "~/assets/js/localstorage";
const config = require("../config.json");
export default {
  data: function () {
    return {
      busy: true,
      feeds: [],
    };
  },
  async asyncData({ store, $axios }) {
    // load feed lsit from local storage (profile)
    const profile = store.state.profile.profile;
    const feeds = profile.feeds ? profile.feeds : []
    console.log('feeds from profile', feeds)

    return { feeds }
  },
  mounted: async function () {
    // show we're busy
    this.busy = true

    // fetch feed list from API
    const profile = this.$store.state.profile.profile;
    console.log("asyncdata profile is", profile);
    const url = `${config.getAllFeedsFunctionUrl.value}?apikey=${profile.apikey}`;
    const feeds = await this.$axios.$get(url);
    this.feeds = feeds.feeds

    // save feed list to localstorage for faster load next time
    const prof = JSON.parse(JSON.stringify(profile))
    prof.feeds = feeds.feeds
    localstorage.saveProfile(prof);
    
    // clear busy indicator
    this.busy = false

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
