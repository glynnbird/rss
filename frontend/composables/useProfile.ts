import localstorage from "~/assets/js/localstorage";

export default function () {
    return useState('profile', function () {
        return localstorage.loadProfile()
    })
}