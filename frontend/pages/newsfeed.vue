<template>
  <div>
    Your articles

    <ul v-if="articles">
      <li v-bind:key="article.articleid" v-for="article in articles">
        <a :href="article.link"> {{ article.title }}</a> <br />
        <div v-html="article.content"></div>
      </li>
    </ul>
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
