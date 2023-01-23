<template>
  <div>
    <!-- search form -->
    <v-row  v-if="searchMode">
      <v-col cols="10">
        <v-text-field ref="search" v-model="searchTerm" label="Search"></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-btn @click="clickClear"  color="primary" icon><v-icon>mdi-close</v-icon></v-btn>
      </v-col>
    </v-row>

        <!-- busy indicator-->
    <v-progress-linear v-if="busy" indeterminate></v-progress-linear>
    <!-- list of articles-->
    <v-list two-line flat dense>
      <!-- one item per article - the divider changes if it's the divider between
           old news and new news-->
      <v-list-item
        v-for="article in articlesAgo"
        :key="article.articleid" 
        :class="{ 'v-list-item-divider': dividerId === article.articleid }"
      >
        <v-list-item-avatar>
          <!-- RSS feed icon-->
          <img :src="article.icon" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            <a :href="article.link" target="_new">
              <!-- new icon - only for articles newer than the dividing line -->
              <v-icon color="blue" v-if="dateOfDivider && article.timestamp >= dateOfDivider">mdi-new-box</v-icon>
              {{ article.title }}
            </a>
          </v-list-item-title>
          <v-list-item-subtitle>
            <a :href="article.link" target="_new">{{ article.content }}</a>
          </v-list-item-subtitle>
          <v-img :src="article.media" v-if="article.media" />
        </v-list-item-content>
        <v-list-item-action>
          <!-- how long ago the article was published -->
          <v-list-item-action-text>{{ article.ago }}</v-list-item-action-text>
          <!-- favourite * button -->
          <v-icon 
            v-if="!article.favourite"
            color="grey lighten-1"
            @click="favourite(article)">
            mdi-star-outline
          </v-icon>
          <v-icon 
            v-else
            color="yellow darken-3"
            @click="defavourite(article)">
            mdi-star
          </v-icon>
          <!-- social sharing widget -->
          <SocialShare :url="article.link" title="Shared via RSS Wrangler"/>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-bottom-navigation app v-if="!searchMode">
      <v-btn @click="clickHome">
        <span>Home</span>
        <v-icon>mdi-home</v-icon>
      </v-btn>      
      <v-btn @click="clickFavourite">
        <span>Favourites</span>
        <v-icon>mdi-heart</v-icon>
      </v-btn>
      <v-btn @click="clickSearch">
        <span>Search</span>
        <v-icon>mdi-file-search</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<style scoped>
.v-list-item__title a:link, .v-list-item__title a:visited, .v-list-item__title a:hover {
  color: rgba(0, 0, 0, 0.87);
  text-decoration: none;
  font-size: 18px
}
.v-list-item__subtitle a:link, .v-list-item__subtitle a:visited, .v-list-item__subtitle a:hover {
  color: rgba(0, 0, 0, 0.60);
  text-decoration: none;
  font-weight: normal;
  font-size: 16px
}
.v-list-item__title, .v-list-item__subtitle {
  flex: 1 1 100%;
  white-space: unset !important
}
.v-avatar {
  align-self: flex-start;
}
.v-list-item {
  padding: 0px;
  border-bottom: 1px solid #eee
}
.v-list-item-divider {
  border-bottom: 3px dashed #aaa
}
.v-list-item__action-text {
  width: 24px;
  text-align: center
}
.v-application--is-ltr .v-list-item__action:last-of-type:not(:only-child), .v-application--is-ltr .v-list-item__avatar:last-of-type:not(:only-child), .v-application--is-ltr .v-list-item__icon:last-of-type:not(:only-child) {
    margin-left: 0px;
}
</style>

<script>
// tools for converting ISO timestamps to "3 days ago"-style
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-GB')

export default {
  props: ["articles", "favourites", "busy", "dividerId"],
  data: function () {
    return {
      timer: 0,
      searchTerm: '',
      searchMode: false
    }
  },
  mounted: function () {
    // increment the timer every second - to force the computed function to recalculate
    setInterval(() => { this.timer++ }, 1000)
    this.clickClear()
  },
  computed: {
    articlesAgo () {
      // this line does nothing but fools Vue.js into thinking that
      // this computed element depends on this.timer, so it gets
      // run every second - so the "ago" timings get updated as the page sits.
      this.timer
      
      // clone the articles
      let clonedArticles = JSON.parse(JSON.stringify(this.articles))

      // add "ago"-style date to each article
      clonedArticles =  clonedArticles.map((a) => {
        a.ago = timeAgo.format(new Date(a.timestamp), 'mini')
        a.favourite = !!this.favourites[a.articleid]
        return a
      })
 
      // if there's a search term, filter the results
      if (this.searchTerm) {
        clonedArticles = clonedArticles.filter((a) => {
          const term = this.searchTerm.toLowerCase()
          if (a.title.toLowerCase().includes(term) ||
            a.content.toLowerCase().includes(term)) {
            return true
          }
          return false
        })
      }
      return clonedArticles
    },
    dateOfDivider: function() {
      if (!this.dividerId) {
        return null
      }
      // calculate the date of the divider between old news and old news
      for(let article of this.articles) {
        if (article.articleid === this.dividerId) {
          return article.timestamp
        }
      }
    }
  },
  methods: {
    favourite: function(article) {
      // favourite an article
      this.$store.commit('profile/addFavourite', article)
    },
    defavourite: function(article) {
      // defavourite an article
      this.$store.commit('profile/deleteFavourite', article)
    },
    clickClear: function() {
      // clear the search form
      this.searchMode = false
      this.searchTerm = ''
      window.scrollTo(0,0)
    },
    clickSearch: function() {
      // scroll beyond the search field
      this.searchMode = true
      setTimeout(() => {
        window.scrollTo(0,0)
        this.$refs["search"].focus()
      },10)
    },
    clickHome: function() {
      window.scrollTo(0,0)
      this.$router.push('/newsfeed');
    },
    clickFavourite: function() {
      window.scrollTo(0,0)
      this.$router.push('/favourites');
    }
  },
};
</script>