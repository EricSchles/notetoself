const Dialog = require('./Dialog');

class HelpDialog extends Dialog {
    constructor(convoState, userState, helpMessage, endDialogCallback) {
        super(convoState, userState, 'help');

        this.endDialog = endDialogCallback;
        this.endDialogForChild = this.onDialogEnd.bind(this);

        this.helpMessage = helpMessage;
    }

    async onTurn(context, message) {
        super.onTurn(context, message, null, async (context, message) => {
            this.endDialog(context, this.name);
            return await context.sendActivity(this.helpMessage);
        });
    }
}

module.exports = HelpDialog;