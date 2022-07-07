<template>
  <v-app>
    <v-app-bar app class="light-blue">
      <v-toolbar-title @click="onHome">
        <span class="apptitle">RSS Wrangler</span>
      </v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer app>
      <v-col class="text-center" cols="12">
        Copyright {{ new Date().getFullYear() }}
      </v-col>
    </v-footer>
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