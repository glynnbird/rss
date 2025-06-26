<script setup>
  const auth = useAuth()
  const feeds = ref([])
  const busy = ref(false)
  
  // config
  const config = useRuntimeConfig()
  const apiHome = config.public['apiBase'] || window.location.origin

  // get list of feeds from the API
  // make the API call
  const getFeeds = async () => {
    busy.value = true
    console.log('API', '/list', `${apiHome}/api/list`)
    const r = await $fetch(`${apiHome}/api/list`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        apikey: auth.value.apiKey
      }
    })
    feeds.value = r.list
    busy.value = false
  }
  setTimeout(async () => {
    await getFeeds()
  }, 1)

  // delete a feed
  const deleteFeed = async (feedid, index) => {
    busy.value = true
    console.log('Delete feed', feedid)
    console.log('API', '/del', `${apiHome}/api/del`)
    const r = await $fetch(`${apiHome}/api/del`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        apikey: auth.value.apiKey
      },
      body: JSON.stringify({ id: feedid })
    })
    feeds.value.splice(index, 1)
    busy.value = false
  }

</script>
<template>
  <h3>Feeds List</h3>
  <!-- busy indicator-->
  <v-progress-linear v-if="busy" indeterminate></v-progress-linear>
  <v-list>
    <v-list-item v-for="feed,index in feeds">
      <v-list-item-title>{{ feed.feed_name }}</v-list-item-title>
      <template v-slot:append>
        <v-btn
          @click="deleteFeed(feed.id, index)"
          color="grey-lighten-1"
          icon="mdi-delete"
          variant="text"
        ></v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>
