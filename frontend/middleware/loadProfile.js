import localstorage from "~/assets/js/localstorage";

export default function ({store }) {
  //get the profile from local storage and put it in the store
  const profile = localstorage.loadProfile()
  store.commit("profile/save", profile);
}