<script setup>
  // composables
  const auth = useAuth()
  auth.value.authenticated = false
  localStorage.clear()
  await navigateTo('/login')
</script>
