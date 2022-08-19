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
import localstorage from "~/assets/js/localstorage";

export default {
  data: function () {
    return {
      profile: null,
      apikey: null,
    };
  },
  async asyncData({ store, redirect }) {
    console.log("asyncdata profile is", store.state.profile.profile);
    if (store.state.profile.profile) {
      //already logged in, so bounce to newsfeed
      redirect("/newsfeed");
    }
  },

  methods: {
    saveKey: async function () {
      console.log("Saving Profile");
      const obj = { apikey: this.apikey };
      localstorage.saveProfile(obj);
      this.profile = obj;
      this.$router.push("/newsfeed");
    },
  },
};
</script>
