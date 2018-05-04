const botbuilder = require('botbuilder');
const Dialog = require('./Dialog');

class SaveContentDialog extends Dialog {
    constructor(convoState, userState, name, endDialogCallback) {
        super(convoState, userState, name);

        this.endDialog = endDialogCallback;
    }

    async onTurn(context, message) {
        super.onTurn(context, message, async (context, message) => {
            const currentConvoState = this.convoState? this.convoState.get(context) : null;
            const currentUserState = this.userState? this.userState.get(context) : null;

            if (!currentConvoState.prompt) {
                currentConvoState.prompt = 'type';
                currentConvoState.newContent = {};
                const saveContentMessageCard = botbuilder.MessageFactory.attachment(botbuilder.CardFactory.heroCard('What type of content do you want to save?', null, [
                    {
                        "type": "imBack",
                        "title": "Link",
                        "value": "link",
                        "displaytext": "link"
                    },
                    {
                        "type": "imBack",
                        "title": "Text",
                        "value": "text",
                        "displaytext": "text"
                    },
                    {
                        "type": "imBack",
                        "title": "Code",
                        "value": "code",
                        "displaytext": "code"
                    },
                    {
                        "type": "imBack",
                        "title": "Other",
                        "value": "other",
                        "displaytext": "other"
                    }
                ]));
                return await context.sendActivity(saveContentMessageCard);
            } else {
                switch(currentConvoState.prompt) {
                    case 'type':
                        currentConvoState.prompt = 'content';
                        currentConvoState.newContent.contentType = message;
                        return await context.sendActivity('Great! Now please send me the content you want to save');
                    case 'content':
                        currentConvoState.prompt = 'tags';
                        currentConvoState.newContent.content = message;
                        return await context.sendActivity('Thank you! What do you want to tag this as? Please enter a comma-deliminated list');
                    case 'tags':
                        currentConvoState.prompt = undefined;
                        currentConvoState.newContent.tags = this.processTags(message);
                        this.endDialog(context);
                        //TODO: add undo
                        return;
                    default:
                        return await context.sendActivity('I don\'t know what\'s going on!');
                }
            }
        });
    }


    processTags(tags) {
        const tagsAry = tags.split(",");
        const finalTags = tagsAry.map(tag => tag.trim().toLowerCase());
        return finalTags;
    }
}

module.exports = SaveContentDialog;