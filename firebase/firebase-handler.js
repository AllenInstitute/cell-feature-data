const {
    isEmpty,
    isEqual
} = require('lodash');
const {
    firestore
} = require('./setup-firebase');


class FirebaseHandler {
    constructor(id, name, megasetName="") {
        this.id = id;
        this.datasetName = name;
        this.megasetName = megasetName;
        this.featureDefEndpoint = `dataset-data/feature-definitions/${this.datasetName}`;
        this.manifestEndpoint = "manifests";
        this.datasetDescriptionEndpoint = "dataset-descriptions";
        this.cellLineDefEndpoint = "cell-line-def";
        this.cellFileInfoEndpoint = "cell-file-info";
        this.cellRef = firestore.collection('cell-data').doc(this.id);
    }

    docExists(ref) {
        return ref.get().then(snap => snap.exists)
    }

    async uploadManifest(data) {

        const ref = firestore.collection(this.manifestEndpoint).doc(this.id)
        const manifestExists = await this.docExists(ref)
        if (manifestExists) {
            /**
             * Remove these fields if just updating a manifest, don't want to clear out
             * the pointers if we're just updating some data
             */
            delete data.cellLineDataPath
            delete data.albumPath
            delete data.featuresDataPath
            delete data.featureDefsPath
            delete data.viewerSettingsPath
            return firestore.collection(this.manifestEndpoint).doc(this.id).update(data)

        }
        return firestore.collection(this.manifestEndpoint).doc(this.id).set(data)
    }

    async updateDatasetDoc(data) {
        const document = await firestore.collection(this.datasetDescriptionEndpoint).doc(this.megasetName).get().then(
            doc => doc.data()
        )
        const datasets = document.datasets;
        datasets[this.id] = {...datasets[this.id], ...data}
        return firestore.collection(this.datasetDescriptionEndpoint).doc(this.megasetName).update({datasets})
    }

    updateManifest(data) {
        return firestore.collection(this.manifestEndpoint).doc(this.id).update(data)
    }

    uploadData(collectionName, data) {
        return firestore.collection(collectionName).doc(this.id).set(data)
    }

    getCellLineDefs() {
        return firestore.collection(this.cellLineDefEndpoint).get()
            .then(snapshot => {
                const data = {}
                snapshot.forEach((doc) => data[doc.id] = doc.data());
                return data
            })
    }

    checkCellLineInDataset(id) {
        return this.cellRef.collection(this.cellLineDefEndpoint).doc(id).get()
            .then(snapshot => {
                if (snapshot.exists) {

                    return snapshot.data()
                }
                return false;
            })
    }

    checkFeatureExists(feature) {
        return firestore.collection(this.featureDefEndpoint).doc(feature.key).get()
            .then(snapshot => {
                if (snapshot.exists) {
                    const changedFeatures = {}
                    const dbFeature = snapshot.data();
                    for (const key in feature) {
                        if (Object.hasOwnProperty.call(feature, key)) {
                            const newValue = feature[key];
                            if (!isEqual(dbFeature[key], newValue)) {
                                changedFeatures[key] = dbFeature[key]
                            }
                        }
                    }
                    if (isEmpty(changedFeatures)) {
                        return false
                    }
                    return changedFeatures;
                } else {
                    return false;
                }
            })
    }

    addFeature(feature) {
        return firestore.collection(this.featureDefEndpoint).doc(feature.key).set(feature)

    }

    updateFeatureCount(feature, option, count) {
        const update = {
            [`options.${option}.count`] : count
        }
        return firestore.collection(this.featureDefEndpoint).doc(feature).update(update)
    }

    uploadArrayUsingKeys(array, collectionName, docKey) {
        return Promise.all(array.map(async (ele) => {
            const doc = await firestore.collection(collectionName).doc(ele[docKey]).get()
            if (doc.exists) {
                return firestore.collection(collectionName).doc(ele[docKey]).update(ele)
            } else {
                return firestore.collection(collectionName).doc(ele[docKey]).set(ele)
            }
        }))
    }
}

module.exports = FirebaseHandler;