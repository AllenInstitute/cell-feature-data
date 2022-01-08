const fsPromises = require('fs').promises;
const upload = require("../../aws");

const uploadFileToS3 = async (id, readFolder, filename) => {
    console.log("uploading json to s3...");
    const fileContent = await fsPromises.readFile(`${readFolder}/${filename}`);
    const dir = process.env.NODE_ENV || "dev";
    // if not production, store file at a different location 
    const fileName = process.env.NODE_ENV == "production" ? `${id}/${filename}` : `${id}/${dir}/${filename}`;
    // Setting up S3 upload parameters
    const params = {
        Bucket: "bisque.allencell.org",
        Key: fileName, // File name in S3
        Body: fileContent
    };
    return upload(params)
        .then((location) => {
            return location;
        })
        .catch((err) => {
            console.error("ERROR UPLOADING TO AWS", err);
            process.exit(1);
        })

};

module.exports = uploadFileToS3