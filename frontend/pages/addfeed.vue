<template>
  <div>
    <v-progress-linear v-if="submitted" :indeterminate="true"></v-progress-linear>
    <v-alert v-model="error" dismissible type="error">
      Unable to add feed. Please check your URL
    </v-alert>
    <v-card>
      <v-card-title>Add Feed</v-card-title>
      <v-card-subtitle>
        Enter the full URL of the RSS feed you want to add.
      </v-card-subtitle>
      <v-card-text>
        <v-form ref="form">
          <v-text-field v-model="url" label="https://myurl.com" required></v-text-field>

          <v-btn
            :disabled="saveDisabled || submitted"
            color="success"
            class="mr-4"
            @click="onSubmit"
          >
            Submit
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions></v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.separate {
  margin-bottom: 20px;
}
</style>

<script>
const config = require("../config.json");

export default {
  data: function () {
    return {
      url: "",
      submitted: false,
      error: false
    };
  },
  async asyncData({ redirect,store}) {
    // load feed lsit from local storage (profile)
    const profile = store.state.profile.profile;
    if (!profile) {
      //not logged in so bounce to home page
      redirect('/')
      return
    }
    store.commit('page/setTitle', 'Add Feed')
  },
  computed: {
    saveDisabled: function () {
      if (!this.url) {
        return true;
      }
      return false;
    },
  },
  methods: {
    onSubmit: async function () {
      this.submitted=true
      this.error=false
      const profile = this.$store.state.profile.profile;
      const url = `${config.addFeedFunctionUrl.value}?apikey=${profile.apikey}&url=${this.url}`;
      try {
        const articles = await this.$axios.$get(url);
        this.$router.push("/showfeeds");
      } catch (e) {
        this.submitted = false
        this.error=true
      }
    }
  }
}
</script>
