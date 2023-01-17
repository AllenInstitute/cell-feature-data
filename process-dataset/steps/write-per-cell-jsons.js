const fsPromises = require('fs').promises;
const {
    find,
    map,
} = require("lodash");
const StreamZip = require('node-stream-zip');

const schemas = require("../../data-validation/full-schema");
const dataPrep = require("../../data-validation/data-prep");
const {
    FILE_INFO_KEYS,
    TEMP_LOCAL_CELL_FEATURE_JSON,
    TEMP_LOCAL_FILE_INFO_JSON,
} = require("../constants");


const formatAndWritePerCellJsons = async (firebaseHandler, readFolder, outFolder, featureDataFileName, featureDefs, defaultGroupBy, defaultGroupByIndex) => {

    console.log("writing out file info json...")
    let json;
    try {
        const data = await fsPromises.readFile(`${readFolder}/${featureDataFileName}`);
        json = JSON.parse(data)
    } catch (error) {
        const fileName = featureDataFileName.replace(".json", ".zip");
        console.log("reading zip file", `${readFolder}/${fileName}`)
        const zip = new StreamZip.async({ file: `${readFolder}/${fileName}` });
        const data = await zip.entryData(`${featureDataFileName}`);
        json = JSON.parse(data)
        await zip.close();
    }

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
            i: fileInfo.CellId.toString(),
        }
    }
    /* end of feature json loop */

    map(counts, (value, key) => {
        firebaseHandler.updateFeatureCount(defaultGroupBy, key, value)
    })

    const {
        data: fileInfoDoc,
        valid: fileInfoValid,
        error: fileInfoError
    } = dataPrep.validate(fileInfoJson, schemas.fileInfo);
    const {
        data: measuredFeatureDoc,
        valid: featuresValid,
        error: featuresError,
    } = dataPrep.validate(measuredFeaturesJson, schemas.measuredFeaturesDoc);
    if (fileInfoValid && featuresValid) {
        return Promise.all([fsPromises.writeFile(`${outFolder}/${TEMP_LOCAL_CELL_FEATURE_JSON}`, JSON.stringify(measuredFeatureDoc)),
            fsPromises.writeFile(`${outFolder}/${TEMP_LOCAL_FILE_INFO_JSON}`, JSON.stringify(fileInfoDoc))
        ])
    } else {
        console.error("failed json validation")
        if (fileInfoError) {
            console.error("FILE INFO", fileInfoError)
        }
        if (featuresError) {
            console.error("MEASURED FEATURE", featuresError)
        }
        process.exit(1);
    }
    

}

module.exports = formatAndWritePerCellJsons