
<script setup>
  // composables
//   const auth = useAuth()
//   const route = useRoute()

  // local page items
  const drawer = ref(0)
  drawer.value = false
</script>
<template>   
  <v-app theme="light">
    <v-app-bar density="compact">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title @click="navigateTo('/')">RSS</v-app-bar-title>
      <template v-slot:append>
        <!-- <v-btn v-if="route.name === 'index'" icon="mdi-plus" @click="navigateTo('/add')"></v-btn>
        <v-btn v-if="route.name !== 'index'" icon="mdi-chevron-left" @click="navigateTo('/')"></v-btn> -->
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" location="left">
      <v-list>
        <v-list-item prepend-icon="mdi-home" title="Home" @click="navigateTo('/')"></v-list-item>
        <v-list-item prepend-icon="mdi-information" title="About" @click="navigateTo('/about')"></v-list-item>
        <!-- <v-list-item v-if="auth.authenticated" prepend-icon="mdi-logout" title="Logout" @click="navigateTo('/logout')"></v-list-item>
        <v-list-item v-if="!auth.authenticated" prepend-icon="mdi-login" title="Login" @click="navigateTo('/login')"></v-list-item> -->
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
