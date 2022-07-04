export const state = () => ({
    profile: null
    })
    
    export const mutations = {
      save(state, obj) {
        state.profile = obj  
        console.log("profile inserted ") 
      },
    }
  