const fsPromises = require('fs').promises;
const { reduce, map, mapKeys } = require('lodash');
const {
    firestore
} = require('./setup-firebase');

const CELL_ID_KEY = "CellId";
const FOV_ID_KEY = "FOVId";
const CELL_LINE_ID_KEY = "CellLineId_Name";
const PROTEIN_NAME_KEY = "structureProteinName";
const CELL_LINE_NAME_KEY = "CellLineName";
const PROTEIN_DISPLAY_NAME_KEY = 'ProteinId_DisplayName';

const ref = firestore.collection('cfe-datasets').doc('v1');

const writeAlbums = () => {

    return fsPromises.readFile('./albums.json')
        .then((data) => JSON.parse(data))
        .then((json) => 
            Promise.all(json.map((ele) => ref.collection('albums').add(ele)))
            )
        .then((returned) => {
            // update docs with firebase generated id
            return Promise.all(returned.map((docRef) => ref.collection('albums').doc(docRef.id).update({
                id: docRef.id
            })))
        })
}

const formatCellLineDefs = () => (
    fsPromises.readFile('./cell-line-def.json')
            .then((data) => JSON.parse(data))
            .then((json) => json.map((ele) => mapKeys(ele, (value, key) => key.replace('/', '_')
                )
            ))
)

const writeCellLineDefs = () => {

    return formatCellLineDefs()
        .then((json) => Promise.all(
                json.map((ele) => 
                    ref.collection('cell-line-def').doc(ele.CellLineId_Name).set(ele)
                )
            )
        )
}

const writeFovMapping = () => {

    return formatCellLineDefs()
        .then(cellLineDefs => {
    
            fsPromises.readFile('./cell-feature-analysis.json')
                .then((data) => JSON.parse(data))
                .then((json) => {
            
            
                        return reduce(
                            json,
                            (acc, cur) => {
                                const data = cur.file_info;
                                const curFovId = data[FOV_ID_KEY];
                                const proteinName = cellLineDefs.find((ele) => ele[CELL_LINE_ID_KEY] === data.CellLineName)[PROTEIN_DISPLAY_NAME_KEY]
                                if (!acc[curFovId]) {
                                    acc[curFovId] = {
                                        cellIds: [data[CELL_ID_KEY]],
                                        [CELL_LINE_NAME_KEY]: data.CellLineName,
                                        [PROTEIN_NAME_KEY]: proteinName
                                    };
                                } else {
                                    acc[curFovId].cellIds = [...acc[curFovId].cellIds, data[CELL_ID_KEY]];
                                }
            
                                return acc;
                            },{});
                })
                .then((fovMapping) => 
                    Promise.all(
    
                        map(fovMapping, (data, key) => {
                            return ref.collection('fov-mapping').doc(key).set(data);
                        })
                    )
                )
                .catch(console.log)
        })
}


const writeCellFeatureData = () => {

    return fsPromises.readFile('./cell-feature-analysis.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            const writeBatch = (batch) => Promise.all(batch.map((ele) => ref.collection('cell-feature-analysis').doc(ele.file_info.CellId.toString()).set(ele)))
                

            const makeBatch = () => {
                let batchToWrite = json.splice(0, 100);
                console.log('writing set', batchToWrite.length)
                if (batchToWrite.length) {
                    return writeBatch(batchToWrite)
                                .then(() => {
                                    console.log('wrote', 'left:', json.length)
                                    return makeBatch()
                                })
                } else {
                    console.log(batchToWrite, json.length)
                    return Promise.resolve()
                }
            }
            return makeBatch()
        })

        .catch(console.log)

}

Promise.all([writeAlbums(), writeCellLineDefs(), writeCellFeatureData(), writeFovMapping()])
    .then(() => process.exit(0))


