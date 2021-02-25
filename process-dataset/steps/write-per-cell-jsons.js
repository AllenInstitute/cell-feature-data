const fsPromises = require('fs').promises;
const {
    find
} = require("lodash");

const schemas = require("../data-validation/schema");
const dataPrep = require("../data-validation/data-prep");
const {
    CELL_LINE_NAME_KEY,
    FILE_INFO_KEYS,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    TEMP_LOCAL_CELL_FEATURE_JSON,
    TEMP_LOCAL_FILE_INFO_JSON,
    FOV_ID_KEY,
    CELL_ID_KEY
} = require("../constants");


const formatAndWritePerCellJsons = async (readFolder, outFolder, featureDataFileName, cellLines) => {

    console.log("writing out file info json...")
    return fsPromises.readFile(`${readFolder}/${featureDataFileName}`)
        .then((data) => JSON.parse(data))
        .then(async (json) => {
            const measuredFeaturesJson = [];
            const fileInfoJson = [];
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
                const cellLine = find(cellLines, {
                    [CELL_LINE_DEF_NAME_KEY]: fileInfo[CELL_LINE_NAME_KEY]
                });
                if (!cellLine) {
                    console.error("No matching cell line for this cell in the dataset", fileInfo)
                    process.exit(1)
                }
                const dirPath = `/${cellLine.CellLineId_Name}/${cellLine.CellLineId_Name}_${fileInfo[FOV_ID_KEY]}`
                if (!fileInfo.thumbnailPath) {
                    fileInfo.thumbnailPath = `${dirPath}_${fileInfo[CELL_ID_KEY]}.png`;
                }
                if (!fileInfo.fovThumbnailPath) {
                    fileInfo.fovThumbnailPath = `${dirPath}.png`;
                }
                if (!fileInfo.volumeviewerPath) {
                    fileInfo.volumeviewerPath = `${dirPath}_${fileInfo[CELL_ID_KEY]}.json`;
                }
                if (!fileInfo.fovVolumeviewerPath) {
                    fileInfo.fovVolumeviewerPath = `${dirPath}.json`;
                }
                fileInfoJson[index] = fileInfo;

                measuredFeaturesJson[index] = {
                    f: cellData.features,
                    p: cellLine[CELL_LINE_DEF_PROTEIN_KEY],
                    t: fileInfo.thumbnailPath,
                    i: fileInfo.CellId,
                }

            }

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