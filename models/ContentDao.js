//DocumentDB quickstart sample downloaded from Azure

const DocumentDBClient = require('documentdb').DocumentClient;
const DocdbUtils = require('../helpers/DocumentDBUtils');
const hash = require('object-hash');

class ContentDao {
    constructor(databaseId, collectionId, userId) {
        this.client = new DocumentDBClient(process.env.DB_HOST, { masterKey: process.env.DB_AUTH_KEY });
        this.databaseId = databaseId;
        this.collectionId = collectionId;
        this.userId = userId;
        this.database = null;
        this.collection = null;
        this.user = null;
    }

    init() {
        return DocdbUtils.getOrCreateDatabaseAsync(this.client, this.databaseId).then((db) => {
            this.database = db;
            return DocdbUtils.getOrCreateCollectionAsync(this.client, this.database._self, this.collectionId)
        }).then((coll) => {
            this.collection = coll;
            return DocdbUtils.getOrCreateDocumentAsync(this.client, this.database._self, this.collection._self, this.userId)
        }).then((userDoc) => {
            this.user = userDoc;
            return;
        }).catch(err => {
            console.log("ERROR INIT CONTENTDAO IN CONTENTDAO");
            console.log(err);
        });
    }

    addContent(content) {
        const contentHash = hash(content, {
            excludeKeys: (key) => key === 'tags'
        });
        if (this.user.content[contentHash]) {
            //TODO: what if there is a hash conflict???
        } else {
            this.user.content[contentHash] = {
                id: contentHash,
                type: "content",
                date: Date.now(),
                ...content
            };
            content.tags.forEach(tag => {
                this.user.tags[tag]? this.user.tags[tag].idsArray.push(contentHash) : this.user.tags[tag] = {
                    id: tag,
                    type: "tag",
                    idsArray: [contentHash]
                };
            });
        }
        return DocdbUtils.replaceDocumentAsync(this.client, this.user._self, this.user).then(userDoc => {
            this.user = userDoc;
            return;
        }).catch(err => {
            console.log("ERROR ContentDao addContent");
            console.log(err);
        });
    }
}

module.exports = ContentDao;

