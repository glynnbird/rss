
// the key we use to save data against in localStorage
const KEY = 'session'

const localstorage = {
  loadProfile: function () {
    const str = localStorage.getItem(KEY)
    if (str !== null) {
      return JSON.parse(str)
    } else {
      return null
    }
  },
  saveProfile: function (profile) {
    localStorage.setItem(KEY, JSON.stringify(profile))
  },
  deleteProfile: function () {
    localStorage.clear()
  }
}

export default localstorage