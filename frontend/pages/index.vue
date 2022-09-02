<template>
  <div>
    <div>Enter your API Key to proceed</div>
    <v-form ref="form">
      <v-text-field v-model="apikey" label="Api Key"></v-text-field>
      <v-btn :disabled="!apikey" color="success" @click="saveKey">
        Submit
      </v-btn>
    </v-form>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      apikey: null,
    };
  },
  async asyncData({ store, redirect }) {
    if (store.state.profile.profile) {
      //already logged in, so bounce to newsfeed
      return redirect("/newsfeed");
    }
    store.commit('page/setTitle', '')
  },

  methods: {
    saveKey: async function () {
      this.$store.commit('profile/saveAPIKey', this.apikey)
      this.$router.push("/newsfeed");
    },
  },
};
</script>
