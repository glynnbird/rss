<template>
  <div>
    <v-progress-linear v-if="submitted" :indeterminate="true"></v-progress-linear>

    <v-card>
      <v-card-title>Add Feed</v-card-title>
      <v-card-subtitle>
        Enter the full URL of the RSS feed you want to add.
      </v-card-subtitle>
      <v-card-text>
        <v-form ref="form">
          <v-text-field v-model="url" label="Feed URL" required></v-text-field>

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
      submitted: false
    };
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
      const profile = this.$store.state.profile.profile;
      const url = `${config.addFeedFunctionUrl.value}?apikey=${profile.apikey}&url=${this.url}`;
      const articles = await this.$axios.$get(url);
      console.log("feed added!")
      this.$router.push("/showfeeds");
    },
  },
};
</script>