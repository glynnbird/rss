<template>
  <div>Logging out...</div>
</template>

<script>
import localstorage from "~/assets/js/localstorage";

export default {
  async asyncData({ store, redirect }) {
    const profile = localstorage.deleteProfile();
    redirect("/");
  },
};
</script>
