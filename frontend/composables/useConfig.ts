import config from "../config.json"

export default function () {
    return useState('config', function () {
        console.log("returning this config", config)
        return config
    })
}