const fsPromises = require('fs').promises;
const upload = require("../aws");
const args = process.argv.slice(2);
console.log('Received: ', args);

const FirebaseHandler = require('../firebase/firebase-handler');

const datasetReadFolder = args[0];

const readDatasetInfo = async () => {
    const data = await fsPromises.readFile(`${datasetReadFolder}/dataset.json`)
    return JSON.parse(data)
}

const readImage = async (imageFileName) => {
    return fsPromises.readFile(`${datasetReadFolder}/${imageFileName}`)
}

const uploadDatasetImage = async () => {

    if (!datasetReadFolder) {
        console.log("NEED A DATASET FOLDER TO RELEASE")
        process.exit(1)
    }

    fsPromises.readdir(datasetReadFolder)
        .catch((error) => {
            console.log("COULDN'T READ DIRECTORY:", error)
        })

    const datasetJson = await readDatasetInfo();
    const {
        id,
        image
    } = datasetJson;

    const firebaseHandler = new FirebaseHandler(id);
    console.log("Dataset name:", firebaseHandler.datasetName, image)

    console.log("uploading image to s3...");
    const fileContent = await readImage(image);

    // Setting up S3 upload parameters
    const params = {
        Bucket: "bisque.allencell.org",
        Key: `${firebaseHandler.datasetName}/${image}`, // File name in S3
        Body: fileContent
    };
    await upload(params)
        .then((location) => {
            console.log("updating doc with image location...", location);

            return firebaseHandler.updateDatasetDoc({
                image: location
            })
        })
        .catch((err) => {
            console.error("ERROR UPLOADING TO AWS", err);
            process.exit(1);
        })



    console.log(`${id} has ${image} uploaded`)
    process.exit(0)

}

uploadDatasetImage()