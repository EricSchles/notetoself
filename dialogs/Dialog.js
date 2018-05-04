class Dialog {
    constructor(convoState, userState, name) {
        this.convoState = convoState;
        this.userState = userState;
        this.name = name;
        this.children = [];
        this.currentLocation = name;
    }

    async onTurn(context, message, onActualTurn) {
        if (this.currentLocation !== this.name) {
            return await this.currentLocation.onTurn(context, message);
        } else {
            return await onActualTurn(context, message);
        }
    }

    async onDialogEnd(context, name) {
        this.currentLocation = this.name;
        let dialogIndex = undefined;
        this.children.find((element, index) => {
            if (element.name === name) {
                dialogIndex = index;
                return true;
            } else {
                return false;
            }
        });
        if (dialogIndex !== undefined && dialogIndex !== null) {
            this.children.splice(dialogIndex, 1);
        }
    }

    newChild(dialog) {
        this.currentLocation = dialog;
        this.children.push(dialog);
    }
}

module.exports = Dialog;