const botbuilder = require('botbuilder');
const HelpDialog = require('./HelpDialog');
const Dialog = require('./Dialog');

class SaveContentDialog extends Dialog {
    constructor(convoState, userState, name, endDialogCallback) {
        super(convoState, userState, name);

        this.endDialog = endDialogCallback;
        this.endDialogForChild = this.onDialogEnd.bind(this);

        this.helpDialog = new HelpDialog(convoState, userState, 'List of available commands:<br>`help`: will send a list of available commands in your current dialog<br>`cancel`: will cancel saving the connect you\'re currently trying to save<br>Or simply follow the prompt I sent above', this.endDialogForChild);
    }

    async onTurn(context, message) {
        super.onTurn(context, message, this.helpDialog, async (context, message) => {
            const currentConvoState = this.convoState? this.convoState.get(context) : null;
            const currentUserState = this.userState? this.userState.get(context) : null;

            if (message === 'cancel') {
                this.endDialog(context, this.name);
                currentConvoState.prompt = undefined;
                currentConvoState.newContent = undefined;
                return await context.sendActivity("Content save canceled. Let me know later if you want to save something else!");
            }

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
                        this.endDialog(context, this.name);
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