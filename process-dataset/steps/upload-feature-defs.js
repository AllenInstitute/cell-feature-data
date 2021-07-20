const fsPromises = require('fs').promises;
const prompt = require('prompt');

const dataPrep = require("../data-validation/data-prep");
const schemas = require("../data-validation/schema");

const readFeatureData = async (readFolder, featureDefFileName) => {
    const data = await fsPromises.readFile(`${readFolder}/${featureDefFileName}`)
    return JSON.parse(data)
}

const uploadFeatureDefs = async (firebaseHandler, readFolder, featureDefFileName) => {
    console.log("uploading feature defs...")
    const featureDefs = await readFeatureData(readFolder, featureDefFileName);
    for (let index = 0; index < featureDefs.length; index++) {
        const feature = featureDefs[index];

        const featureData = dataPrep.initialize(feature, schemas.featureDefSchema)
        const diffToDatabase = await firebaseHandler.checkFeatureExists(featureData)
        const featureCheck = dataPrep.validate(featureData, schemas.featureDef)
        if (diffToDatabase && featureCheck.valid) {
            prompt.start();
            console.log(`feature "${feature.key}" is already in db`)
            for (const key in diffToDatabase) {
                if (Object.hasOwnProperty.call(diffToDatabase, key)) {
                    const element = diffToDatabase[key];
                    console.log(`${key} DB VALUE: ${JSON.stringify(element)}, NEW VALUE: ${JSON.stringify(featureData[key])}`)
                }
            }
            console.log("Do you want to over write what is in the DB? (Y/N)")
            const {
                shouldWrite
            } = await prompt.get(['shouldWrite']);
            if (shouldWrite.toLowerCase() === "y") {
                await firebaseHandler.addFeature(feature)
            }



        } else if (featureCheck.valid) {
            await firebaseHandler.addFeature(feature)
        }

    }
    console.log("uploading feature defs complete")


}

module.exports = uploadFeatureDefs