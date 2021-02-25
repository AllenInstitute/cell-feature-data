const fsPromises = require('fs').promises;
const AWS = require('aws-sdk');

const { TEMP_LOCAL_CELL_FEATURE_JSON } = require("../constants");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});


const upload = (params) => {
    return new Promise((resolve, reject) => {
        s3.upload(params, function (err, data) {
            if (err) {
                return reject(err)
            }
            console.log(`File uploaded successfully. ${data.Location}`);
            resolve(data.Location)
        });
    })
}

const uploadFileToS3 = async (id, tmpFolder) => {
    console.log("uploading json to s3...");
    const fileContent = await fsPromises.readFile(`${tmpFolder}/${TEMP_LOCAL_CELL_FEATURE_JSON}`);

    // Setting up S3 upload parameters
    const params = {
        Bucket: "bisque.allencell.org",
        Key: `${id}/cell-feature-analysis.json`, // File name in S3
        Body: fileContent
    };
    return upload(params)
        .then((location) => {
            return {
                featuresData: location
            }
        })
        .catch((err) => {
            console.error("ERROR UPLOADING TO AWS", err);
            process.exit(1);
        })

};

module.exports = uploadFileToS3