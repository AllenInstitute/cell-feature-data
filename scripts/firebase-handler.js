const {
    firestore
} = require('./setup-firebase');


class FirebaseHandler {
    constructor(version) {
        this.ref = firestore.collection('cfe-datasets').doc(version);
    }

    uploadArrayUsingFirebaesIds(array, collectionName) {
        return Promise.all(array.map((ele) => this.ref.collection(collectionName).add(ele)))
    }
    uploadArrayUsingKeys(array, collectionName, docKey) {
        return Promise.all(array.map((ele) => this.ref.collection(collectionName).doc(ele[docKey]).set(ele)))
    }
    writeData(collectionName, docName, data) {
        return this.ref.collection(collectionName).doc(docName).update(data).catch((e) => console.log(collectionName, docName, e))
    }
}

module.exports = FirebaseHandler;