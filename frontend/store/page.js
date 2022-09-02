export const state = () => ({
  title: ''
})

export const mutations = {
  setTitle(state, t) {
    state.title = t  
  }
}