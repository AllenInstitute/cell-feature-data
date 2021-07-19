const functions = require('firebase-functions');

const axios = require('axios')

const webhook = functions.config().slack.webhook

exports.postChangesToManifest = functions.firestore
    .document('manifests/{docId}')
    .onUpdate((change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();
        let text = "";
        if (!newValue.featuresDataPath) {
            text = `Started updating ${JSON.stringify(context.params.docId)} \n Dataset will be unavailable until the manifest is updated`
        } else if (newValue.featuresDataPath && !previousValue.featuresDataPath) {
            text = `Finished updating ${JSON.stringify(context.params.docId)} \n New dataset path ${JSON.stringify(newValue.featuresDataPath)}`
        }
        const body = {
            username: "firebase bot",
            text,
        }
        return axios.post(webhook, body).then(res => {
                console.log(`statusCode: ${res.status}`)
                console.log(res)
            })
            .catch(error => {
                console.error("ERROR", error.response.data)
                console.error("ERROR", error.response)

            })
    });