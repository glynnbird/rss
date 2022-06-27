<template>
  <div>
    <div v-if="!profile">
      <input v-model="apikey">
      <button @click="saveKey">Save</button>
    </div>
    <div v-if="profile">
      Your profile: {{ profile }}

    </div>
  </div>
</template>

<script setup>
import localstorage from "~/assets/js/localstorage";

// Read the instructions here https://v3.nuxtjs.org/migration/component-options/#asyncdata-and-fetch-component-options
const { data: profile, refresh } = await useAsyncData("profile", () => {
        const profile = localstorage.loadProfile();
      if (profile && profile.apikey) {
          console.log("found api key")
        return profile;
      } else {
          console.log("no api key")
        //will bounce to a page to collect apikey
        return;
      }
});
</script>


<script>

export default {
  data: function () {
    return {
      profile: null,
      apikey: null
    };
  },
  methods: {
    saveKey: async function () {
      console.log("Saving Profile")
      const obj = {apikey: this.apikey}
      localstorage.saveProfile(obj)
      this.profile = obj
    }
  }
};
</script>
