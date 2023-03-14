const {
    firestore
} = require('../../src/firebase/setup-firebase');

const args = process.argv.slice(2);
console.log('Received: ', args);

const dataset_name = args[0];
const sub_dataset = args[1]; // optional if you want to just release one dataset within a megaset

const getMegasetDoc = async (datasetName) => {
    return await firestore.collection("dataset-descriptions").doc(datasetName).get()
        .then((doc) => doc.data())

}
const releaseDataset = async () => {
    let megaset = await getMegasetDoc(dataset_name);
    let datasets;
    if (megaset && !sub_dataset) {
        megasetName = dataset_name;
        datasets = Object.keys(megaset.datasets)

    } else if (megaset && sub_dataset) {
        if (!megaset) {
            console.error("No dataset to update, use dataset id, not the folder name")
            process.exit(1)
        }
        datasets = [sub_dataset]

    } else {
        console.error("No dataset to update")
        process.exit(1)
    }
    await firestore.collection("dataset-descriptions").doc(megasetName).set({
        production: true
    }, {merge: true});
    const updatedDatasets = {...megaset.datasets}
    datasets.forEach(ele => {
        updatedDatasets[ele].production = true
    })

    Promise.all(
        await firestore.collection("dataset-descriptions").doc(megasetName).update({
           datasets: updatedDatasets
        })
    )

    console.log(`${megasetName} is now released to production`)
    process.exit(0)

}

releaseDataset()