<template>
  <v-app>
    <NavDrawer ref="drawer" />
    <v-app-bar app class="light-blue">
      <v-app-bar-nav-icon
        @click="$refs.drawer.show = !$refs.drawer.show"
      ></v-app-bar-nav-icon>
      <v-toolbar-title @click="onHome">
        <span class="apptitle">RSS Wrangler</span>
      </v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  methods: {
    onHome: function () {
      this.$router.push("/");
    },
  },
};
</script>