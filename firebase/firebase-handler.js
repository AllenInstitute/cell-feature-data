const { isEmpty, isEqual } = require('lodash');
const {
    firestore
} = require('./setup-firebase');


class FirebaseHandler {
    constructor(id) {
        this.id = id;
        this.featureDefEndpoint = "feature-definitions";
        this.manifestEndpoint = "manifests";
        this.datasetDescriptionEndpoint = "dataset-descriptions";
        this.cellLineDefEndpoint = "cell-line-def";
        this.cellFileInfoEndpoint = "cell-file-info";
        this.cellRef = firestore.collection('cell-data').doc(id);
    }

    uploadDatasetDoc(data) {
        return firestore.collection(this.datasetDescriptionEndpoint).doc(data.id).set(data)
    }

    uploadManifest(data) {
        return firestore.collection(this.manifestEndpoint).doc(this.id).set(data)
    }

    updateDatasetDoc(data) {
        return firestore.collection(this.datasetDescriptionEndpoint).doc(this.id).update(data)
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
                if (snapshot.exists ) {
                    const changedFeatures = {}
                    const dbFeature = snapshot.data();
                    for (const key in feature) {
                        if (Object.hasOwnProperty.call(feature, key)) {
                            const newValue = feature[key];
                            if (!isEqual( dbFeature[key], newValue)) {
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

    uploadArrayUsingKeys(array, collectionName, docKey) {
        return Promise.all(array.map( async(ele) => {
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