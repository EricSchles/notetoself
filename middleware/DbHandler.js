const ContentDao = require('../models/ContentDao');

class DBHandler {
    constructor(conversationState, userState) {
        this.conversationState = conversationState;
        this.userState = userState;
        this.contentDao = null;
    }

    async onTurn(context, next) {
        //before turn
        if (!this.contentDao) { //first turn
            this.contentDao = new ContentDao(process.env.DB_ID, process.env.DB_COLLECTION_ID, context.activity.from.id);
            await this.contentDao.init();
            if (!this.contentDao.database || !this.contentDao.collection || !this.contentDao.user){
                console.log("problem initiating the content dao in the handler!");
            }
        }

        const currentConvoStateBefore = this.conversationState.get(context);
        const previousPromptState = currentConvoStateBefore.prompt;

        //make turn happen
        next();

        //after turn
        const currentConvoStateAfter = this.conversationState.get(context);
        if (previousPromptState === 'tags' && currentConvoStateAfter.prompt === undefined) { //user finished putting in content
            this.contentDao.addContent(currentConvoStateAfter.newContent);
            currentConvoStateAfter.newContent = undefined;
        }

        
    }
};

module.exports = DBHandler;