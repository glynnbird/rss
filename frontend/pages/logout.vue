<template>
  <div>
    <button @click="logout">Log Out</button>
  </div>
</template>

<script>
import localstorage from "~/assets/js/localstorage";

export default {

  methods: {
    logout: async function () {
        console.log("logging out...")
        const profile = localstorage.deleteProfile();
        const router = useRouter()
        router.push({ name: "index" });
    }
  }
};
</script>
