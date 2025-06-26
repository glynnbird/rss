export default defineNuxtRouteMiddleware((to, from) => {
  // composables
  const auth = useState('auth')

  // see if we have an apikey stashed in local storage
  const v = localStorage.getItem('apikey')
  if (v) {
    if (!auth.value) {
      auth.value = {}
    }
    auth.value.authenticated = true
    auth.value.apiKey = v
    return
  }

  // if we're not already on the login page and we're not logged in... go to login page
  if (to.fullPath !== '/login' && (!auth.value || !auth.value.authenticated)) {
    return navigateTo('/login')
  }
})
