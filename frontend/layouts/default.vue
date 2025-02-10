<script setup>
  // composables
  const auth = useAuth()
  const route = useRoute()
  const count = useArticleCount()

  // local page items
  const drawer = ref(false)

  // click the home link
  const clickHome = async () => {
    window.scrollTo(0,0)
    await navigateTo('/')
  }
</script>
<template>   
  <v-app theme="light">
    <v-app-bar density="compact" color="#4CAF50">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title @click="clickHome()" style="user-select:none;">RSS</v-app-bar-title>
      <template v-slot:append>
        <v-chip size="small" label color="blue">{{ count }}</v-chip>
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" location="left">
      <v-list>
        <v-list-item prepend-icon="mdi-home" title="Home" @click="clickHome()"></v-list-item>
        <v-list-item v-if="auth.authenticated" prepend-icon="mdi-format-list-numbered" title="Show Feeds" @click="navigateTo('/showfeeds')"></v-list-item>
        <v-list-item v-if="auth.authenticated" prepend-icon="mdi-plus" title="Add Feed" @click="navigateTo('/addfeed')"></v-list-item>
        <v-list-item v-if="auth.authenticated" prepend-icon="mdi-logout" title="Logout" @click="navigateTo('/logout')"></v-list-item>
        <v-list-item v-if="!auth.authenticated" prepend-icon="mdi-login" title="Login" @click="navigateTo('/login')"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
