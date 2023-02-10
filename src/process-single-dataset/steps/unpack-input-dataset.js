const {
  readDatasetJson,
  readAndParseFile,
  readPossibleZippedFile,
} = require("../../utils");

const unpackInputDataset = async (datasetReadFolder) => {
  const datasetJson = await readDatasetJson(datasetReadFolder);
  const featureDefs = await readAndParseFile(
    `${datasetReadFolder}/${datasetJson.featureDefsPath}`
  );
  const images = await readAndParseFile(
    `${datasetReadFolder}/${datasetJson.viewerSettingsPath}`
  );
  const measuredFeatures = await readPossibleZippedFile(
    datasetReadFolder,
    datasetJson.featuresDataPath
  );

  const inputDataset = {
    dataset: datasetJson,
    "feature-defs": featureDefs,
    "measured-features": measuredFeatures,
    images: images,
  };
  return inputDataset;
};

module.exports = unpackInputDataset;