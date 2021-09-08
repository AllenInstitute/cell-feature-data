const fsPromises = require('fs').promises;
const upload = require("../../aws");

const { TEMP_LOCAL_CELL_FEATURE_JSON } = require("../constants");

const uploadFileToS3 = async (id, tmpFolder) => {
    console.log("uploading json to s3...");
    const fileContent = await fsPromises.readFile(`${tmpFolder}/${TEMP_LOCAL_CELL_FEATURE_JSON}`);
    const dir = process.env.NODE_ENV || "dev";
    // if not production, store file at a different location 
    const fileName = process.env.NODE_ENV == "production" ? `${id}/cell-feature-analysis.json` : `${id}/${dir}/cell-feature-analysis.json`;
    // Setting up S3 upload parameters
    const params = {
        Bucket: "bisque.allencell.org",
        Key: fileName, // File name in S3
        Body: fileContent
    };
    return upload(params)
        .then((location) => {
            return {
                featuresDataPath: location
            }
        })
        .catch((err) => {
            console.error("ERROR UPLOADING TO AWS", err);
            process.exit(1);
        })

};

module.exports = uploadFileToS3