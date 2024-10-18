<script setup>
  const auth = useAuth()
  const url = ref(0)
  url.value = ''
  const busy = ref(1)
  busy.value = false

  // config
  const config = useRuntimeConfig()
  const apiHome = config.public['apiBase'] || window.location.origin

  const addFeed = async () => {
    console.log('Add Feed', url.value)
    console.log('API', '/add', `${apiHome}/api/add`)
    busy.value = true
    const r = await useFetch(`${apiHome}/api/add`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        apikey: auth.value.apiKey
      },
      body: JSON.stringify({ url: url.value })
    })
    busy.value = false
    await navigateTo('/showfeeds')
  }
</script>
<template>
  <h3>Add Feed</h3>
  <!-- busy indicator-->
  <v-progress-linear v-if="busy" indeterminate></v-progress-linear>
  <v-text-field
    v-model="url"
    type="url"
    label="Feed URL"
  ></v-text-field>
  <v-btn :disabled="url.length === 0" class="mt-2" type="button" @click="addFeed()">Submit</v-btn>
</template>
