const fsPromises = require('fs').promises;
const {
    find,
    map,
} = require("lodash");

const schemas = require("../../data-validation/full-schema");
const dataPrep = require("../../data-validation/data-prep");
const {
    FILE_INFO_KEYS,
    TEMP_LOCAL_CELL_FEATURE_JSON,
    TEMP_LOCAL_FILE_INFO_JSON,
} = require("../constants");


const formatAndWritePerCellJsons = async (firebaseHandler, readFolder, outFolder, featureDataFileName, featureDefs, defaultGroupBy, defaultGroupByIndex) => {

    console.log("writing out file info json...")
    return fsPromises.readFile(`${readFolder}/${featureDataFileName}`)
        .then((data) => JSON.parse(data))
        .then(async (json) => {
            const measuredFeaturesJson = [];
            const fileInfoJson = [];
            const counts = {}
            for (let index = 0; index < json.length; index++) {
                const cellData = json[index];
                if (cellData.file_info.length !== FILE_INFO_KEYS.length) {
                    console.error("file info in not in expected format")
                    process.exit(1)
                }
                const fileInfo = cellData.file_info.reduce((acc, cur, index) => {
                    acc[FILE_INFO_KEYS[index]] = cur;
                    return acc;
                }, {});

                const categoryValue = cellData.features[defaultGroupByIndex];
                const groupBy = find(featureDefs, {
                    key: defaultGroupBy
                }).options[categoryValue]
                if (!groupBy) {
                    console.log("NO GROUP BY FOR ", defaultGroupBy, categoryValue);
                    process.exit(1);

                }
                if (!counts[categoryValue]) {
                    counts[categoryValue] = 0;
                }
                counts[categoryValue]++;

                fileInfoJson[index] = fileInfo;

                measuredFeaturesJson[index] = {
                    f: cellData.features,
                    p: groupBy.key || groupBy.name,
                    t: fileInfo.thumbnailPath,
                    i: fileInfo.CellId,
                }
            }
            /* end of feature json loop */

            map(counts, (value, key) => {
                firebaseHandler.updateFeatureCount(defaultGroupBy, key, value)
            })

            const fileInfoCheck = dataPrep.validate(fileInfoJson, schemas.fileInfo);

            const measuredFeaturesCheck = dataPrep.validate(measuredFeaturesJson, schemas.measuredFeaturesDoc)
            if (fileInfoCheck.valid && measuredFeaturesCheck) {

                return Promise.all([fsPromises.writeFile(`${outFolder}/${TEMP_LOCAL_CELL_FEATURE_JSON}`, JSON.stringify(measuredFeaturesJson)),
                    fsPromises.writeFile(`${outFolder}/${TEMP_LOCAL_FILE_INFO_JSON}`, JSON.stringify(fileInfoJson))
                ])
            } else {
                console.error("failed json validation")
                if (fileInfoCheck.error) {
                    console.error(fileInfoCheck.error)
                }
                if (measuredFeaturesCheck.error) {
                    console.error(measuredFeaturesCheck.error)
                }
                process.exit(1);
            }
        })
        .then(() => {
            console.log("writing out file info json complete")
        })

}

module.exports = formatAndWritePerCellJsons