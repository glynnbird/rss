<script setup>
  const auth = useAuth()
  const url = ref(0)
  url.value = ''

  const addFeed = async () => {
    console.log('Add Feed', url.value)
    const u = `https://5fkvznf2si4aryacliozypfb5i0hwths.lambda-url.eu-west-1.on.aws/?apikey=${auth.value.apiKey}&url=${url.value}`
    await $fetch(u)
    await navigateTo('/showfeeds')
  }
</script>
<template>
  <h3>Add Feed</h3>
  <v-text-field
    v-model="url"
    type="url"
    label="Feed URL"
  ></v-text-field>
  <v-btn :disabled="url.length === 0" class="mt-2" type="button" @click="addFeed()">Submit</v-btn>
</template>
