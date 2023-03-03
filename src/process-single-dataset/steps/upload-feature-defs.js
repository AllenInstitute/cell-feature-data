const map = require("lodash").map;
const uniq = require("lodash").uniq;
const filter = require("lodash").filter;

const dataPrep = require("../../data-validation/data-prep");
const schemas = require("../../data-validation/full-schema");

const uploadFeatureDefs = async (firebaseHandler, featureDefs) => {
  console.log("uploading feature defs...");
  for (let index = 0; index < featureDefs.length; index++) {
    const feature = featureDefs[index];
    if (feature.discrete) {
      // check if the options key are unique
      const numKeys = filter(map(feature.options, "keys")).length; // filter will remove any undefined keys
      const numUniqueKeys = uniq(numKeys).length;
      if (numKeys > 0 && numKeys !== numUniqueKeys) {
        console.error("Feature def keys are not unique");
        return process.exit(1);
      }
    }
    const {
      data: validatedFeature,
      valid,
      error,
    } = dataPrep.validate(feature, schemas.featureDef);
    if (valid) {
      await firebaseHandler.addFeature(validatedFeature);
    } else {
      console.log(error);
      process.exit(1);
    }
  }
  console.log("uploading feature defs complete");
  return {
    featureDefsPath: `${firebaseHandler.featureDefEndpoint}`,
  };
};

module.exports = uploadFeatureDefs;
