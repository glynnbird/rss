<template>
  <div>
    <div v-if="!profile">
      <input v-model="apikey" />
      <button @click="saveKey">Save</button>
    </div>
    <div v-if="profile">
      <NuxtLink to="/newsfeed">Proceed to your news feed! </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const config = useConfig();

const profile = useProfile();
</script>


<script>
import localstorage from "~/assets/js/localstorage";

export default {
  data: function () {
    return {
      profile: null,
      apikey: null,
    };
  },
  methods: {
    saveKey: async function () {
      console.log("Saving Profile");
      const obj = { apikey: this.apikey };
      localstorage.saveProfile(obj);
      this.profile=obj

    },
  },
};
</script>
