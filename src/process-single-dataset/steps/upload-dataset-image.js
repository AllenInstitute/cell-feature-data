const fsPromises = require("fs").promises;
const upload = require("../../aws");

const readImage = async (datasetReadFolder, imageFileName) => {
  return fsPromises.readFile(`${datasetReadFolder}/${imageFileName}`);
};

const uploadDatasetImage = async (
  firebaseHandler,
  datasetReadFolder,
  image
) => {
  if (!image) {
    console.log(firebaseHandler.datasetName, "doesn't have an image");
    return {
      image: "",
    };
  }
  console.log("uploading image to s3...");
  let fileContent = "";
  try {
    fileContent = await readImage(datasetReadFolder, image);
  } catch (e) {
    console.log(e);
    return {
      image: "",
    };
  }

  // Setting up S3 upload parameters
  const params = {
    Bucket: "bisque.allencell.org",
    Key: `${firebaseHandler.datasetName}/${image}`, // File name in S3
    Body: fileContent,
  };
  return upload(params)
    .then((location) => {
      return {
        image: location,
      };
    })
    .catch((err) => {
      console.error("ERROR UPLOADING TO AWS", err);
      process.exit(1);
    });
};

module.exports = uploadDatasetImage;
