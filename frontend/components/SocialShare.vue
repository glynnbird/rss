<template>
  <!-- inspired by https://github.com/bradvin/social-share-urls -->
  <v-speed-dial v-model="fab" x-small direction="left">
    <template v-slot:activator>
      <v-btn icon plain v-model="fab" color="gray lighten-5" fab x-small>
        <v-icon v-if="fab">mdi-close</v-icon>
        <v-icon v-else>mdi-share-variant</v-icon>
      </v-btn>
    </template>
    <v-btn fab x-small dark color="blue" :href="whatsAppURL" target="_new">
      <v-icon>mdi-twitter</v-icon>
    </v-btn>
    <v-btn fab x-small dark color="green" :href="twitterURL" target="_new">
      <v-icon>mdi-whatsapp</v-icon>
    </v-btn>
    <v-btn fab x-small dark color="red" @click="copyLink">
      <v-icon>mdi-link</v-icon>
    </v-btn>
  </v-speed-dial>
</template>

<script>
export default {
  props: ["url", "title"],
  data: function () {
    return {
      fab: false
    }
  },
  methods: {
    copyLink () {
      navigator.clipboard.writeText(this.url)
    }
  },
  computed: {
    twitterURL () {
      return `https://twitter.com/intent/tweet?url=${this.url}&text=${this.title}`
    },
    whatsAppURL () {
      return `whatsapp://send/?text=${this.title}%20${this.url}`
    }
  }
}
</script>