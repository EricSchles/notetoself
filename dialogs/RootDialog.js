const Dialog = require('./Dialog');
const HelpDialog = require('./HelpDialog');
const SaveContentDialog = require('./SaveContentDialog');

class RootDialog extends Dialog {
    constructor(convoState, userState, name) {
        super(convoState, userState, name);

        this.onDialogEnd = this.onDialogEnd.bind(this);

        this.helpDialog = new HelpDialog(
            convoState,
            userState,
            'Hi! I\'m NoteToSelf! I\'m here to keep stuff you have to save for later. I\'ll keep your content safe and organize it so you can easily access it later<br><br>List of available commands:<br>`help`: will send a list of available commands in your current dialog<br>`save`: will allow you to save some text, a link, or some code you want to save for later',
            this.onDialogEnd);
    }

    async onTurn(context) {
        const message = this.processMessage(context.activity.text, context.activity.channelId, context.activity.conversation.conversationType);
        super.onTurn(context, message, this.helpDialog, async (context, message) => {
            const currentConvoState = this.convoState? this.convoState.get(context) : null;
            const currentUserState = this.userState? this.userState.get(context) : null;

            if (message === 'save') {
                const newSaveContentDialog = new SaveContentDialog(this.convoState, this.userState, 'saveContent', this.onDialogEnd);
                this.newChild(newSaveContentDialog);
                return await this.currentLocation.onTurn(context, message);
            } else {
                return await context.sendActivity(message);
            }
        });
    }

    processMessage(message, channel, convoType) {
        if (channel === "msteams" && convoType === 'channel') {
            //+9 for the <at></at> tags
            message = message.slice(process.env.BOT_NAME.length+9, message.length);
        }
    
        return message.trim().toLowerCase();
    }
}

module.exports = RootDialog;