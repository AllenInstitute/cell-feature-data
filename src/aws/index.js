const AWS = require('aws-sdk');

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

module.exports = upload