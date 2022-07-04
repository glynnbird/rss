<template>
  <div>
    Your articles
    <v-card outlined v-bind:key="article.articleid" v-for="article in articles">
        <v-card-title>{{ article.title }}</v-card-title>
        <v-card-text v-html="article.content"> </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
// consts declared here magically appear in the vue apps data object, i.e. you don't have to declare them below
// for the magic to happen they have to be declared at the top level, i.e. not even inside an IF (we don't know why!)
//you have to use ".value" to get inside the content of these variables... and we don't know why either!

const config = useConfig();
const profile = useProfile();
const url = `${config.value.articlesFunctionUrl.value}?apikey=${profile.value.apikey}`;
const { data: articles } = await useFetch(url);
</script>

<script>
export default {
  data: function () {
    return {};
  },
  methods: {},
};
</script>
