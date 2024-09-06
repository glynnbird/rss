<script setup>
  const auth = useAuth()
  const feeds = ref(0)
  feeds.value = []

  // get list of feeds from the API
  // make the API call
  const url = 'https://lmbpr7aueajdi3uxedcnipzxfm0huais.lambda-url.eu-west-1.on.aws?apikey=' + auth.value.apiKey
  const { data } = await useFetch(url)
  feeds.value = data.value.feeds

  // delete a feed
  const deleteFeed = async (feedid, index) => {
   console.log('Delete feed', feedid)
   const u = `https://zkjkrn6wtzczz4mqjkqhfi7pzy0eeeyr.lambda-url.eu-west-1.on.aws/?apikey=${auth.value.apiKey}&feedid=${feedid}`
   await $fetch(u)
   feeds.value.splice(index, 1)
  }

</script>
<template>
  <h3>Feeds List</h3>
  <v-list>
    <v-list-item v-for="feed,index in feeds">
      <template v-slot:prepend>
        <v-avatar size="18px">
          <v-img v-if="feed.icon" alt="icon" :src="feed.icon"></v-img>
          <v-icon v-else></v-icon>
        </v-avatar>
      </template>
      <v-list-item-title>{{ feed.feed_name }}</v-list-item-title>
      <v-list-item-subtitle>{{ feed.link }}</v-list-item-subtitle>
      <template v-slot:append>
        <v-btn
          @click="deleteFeed(feed.feedid, index)"
          color="grey-lighten-1"
          icon="mdi-delete"
          variant="text"
        ></v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>
