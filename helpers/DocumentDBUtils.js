//DocumentDB quickstart sample downloaded from Azure

class DocumentDBUtils {
    static getOrCreateDatabase (client, databaseId, callback) {
        const querySpec = {
            query: 'SELECT * FROM root r WHERE r.id= @id',
            parameters: [{
                name: '@id',
                value: databaseId
            }]
        };

        client.queryDatabases(querySpec).toArray(function (err, results) {
            if (err) {
                callback(err);

            } else {
                if (results.length === 0) {
                    const databaseSpec = {
                        id: databaseId
                    };

                    client.createDatabase(databaseSpec, function (err, created) {
                        callback(null, created);
                    });

                } else {
                    callback(null, results[0]);
                }
            }
        });
    }

    //https://stackoverflow.com/questions/22519784/how-do-i-convert-an-existing-callback-api-to-promises
    static getOrCreateDatabaseAsync (client, databaseId) {
        return new Promise((resolve, reject) => {
            this.getOrCreateDatabase(client, databaseId, (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve(data);
            });
        });
    }

    static getOrCreateCollection (client, databaseLink, collectionId, callback) {
        const querySpec = {
            query: 'SELECT * FROM root r WHERE r.id=@id',
            parameters: [{
                name: '@id',
                value: collectionId
            }]
        };             

        client.queryCollections(databaseLink, querySpec).toArray(function (err, results) {
            if (err) {
                callback(err);

            } else {        
                if (results.length === 0) {
                    const collectionSpec = {
                        id: collectionId
                    };

                    client.createCollection(databaseLink, collectionSpec, function (err, created) {
                        callback(null, created);
                    });

                } else {
                    callback(null, results[0]);
                }
            }
        });
    }

    //https://stackoverflow.com/questions/22519784/how-do-i-convert-an-existing-callback-api-to-promises
    static getOrCreateCollectionAsync (client, databaseLink, collectionId) {
        return new Promise((resolve, reject) => {
            this.getOrCreateCollection(client, databaseLink, collectionId, (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve(data);
            });
        });
    };

    static getOrCreateDocument (client, databaseLink, collectionLink, userId, callback) {
        const documentUrl = `dbs/${process.env.DB_ID}/colls/${process.env.DB_COLLECTION_ID}/docs/${userId}`;
        client.readDocument(documentUrl, (err, result) => {
            if (err) {
                console.log(err);
                if (err.code == 404) {
                    client.createDocument(collectionLink, {
                        id: userId,
                        content: {},
                        tags: {},
                        type: "user"
                    }, (err, created) => {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, created);
                        }
                    });
                } else {
                    callback(err);
                }
            } else {
                callback(null, result);
            }
        });
    };

    static getOrCreateDocumentAsync (client, databaseLink, collectionLink, userId) {
        return new Promise((resolve, reject) => {
            this.getOrCreateDocument(client, databaseLink, collectionLink, userId, (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve(data);
            });
        });
    };

    static replaceDocument(client, documentLink, newDocument, callback) {
        client.replaceDocument(documentLink, newDocument, (err, retrievedDoc) => {
            if (err) {
                callback(err);
            } else {
                callback(null, retrievedDoc);
            }
        });
    }

    static replaceDocumentAsync(client, documentLink, newDocument) {
        return new Promise((resolve, reject) => {
            this.replaceDocument(client, documentLink, newDocument, (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve(data);
            });
        });
    }
}

module.exports = DocumentDBUtils;