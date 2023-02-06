const fsPromises = require("fs").promises;
const StreamZip = require('node-stream-zip');

const readAndParseFile = async (path) => {
    const data = await fsPromises.readFile(path);
    return JSON.parse(data);
};

const readDatasetJson = async (folder) => {
    const path = `${folder}/dataset.json`;
    return await readAndParseFile(path);
};

const readPossibleZippedFile = async (folder, fileName) => {
    let parsedData;
    try {
        const data = await fsPromises.readFile(
            `${folder}/${fileName}`
        );
        parsedData = JSON.parse(data);
    } catch (error) {
        if (error.message.includes("no such file or directory")) {
            try {
                const zipFileName = fileName.replace(".json", ".zip");
                const zip = new StreamZip.async({
                    file: `${folder}/${zipFileName}`,
                });
                const data = await zip.entryData(fileName);
                parsedData = JSON.parse(data);
                await zip.close();
            } catch (error) {
                console.log("Was unable to find a json file, or open a zip file", error);
                process.exit(1);
            }
        } else {
            console.log("Was unable to read the JSON file", error);
            process.exit(1);
        }
    }
    return parsedData;
}

module.exports = {
    readDatasetJson,
    readAndParseFile, 
    readPossibleZippedFile
}