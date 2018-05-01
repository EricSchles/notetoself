const botbuilder = require('botbuilder');
const restify = require('restify');
require('dotenv').config();
const DBHelper = require('./helpers/database');
const dbhelper = new DBHelper();

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter (it's ok for MICROSOFT_APP_ID and MICROSOFT_APP_PASSWORD to be blank for now)
const adapter = new botbuilder.BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Add conversation state middleware
const conversationState = new botbuilder.ConversationState(new botbuilder.MemoryStorage()); 
adapter.use(conversationState);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            const message = processMessage(context.activity.text, context.activity.channelId, context.activity.conversation.conversationType);
            const state = conversationState.get(context);
            if (!state.prompt) {
                if (message === 'save') {
                    state.prompt = 'type';
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
                    await context.sendActivity(saveContentMessageCard);
                } else {
                    await context.sendActivity(message);
                }
            } else {
                switch(state.prompt) {
                    case 'type':
                        //TODO manage content
                        state.prompt = 'content';
                        await context.sendActivity('Great! Now please send me the content you want to save');
                        break;
                    case 'content':
                        //TODO manage content
                        state.prompt = 'tags';
                        await context.sendActivity('Thank you! What do you want to tag this as? Please enter a comma-deliminated list');
                        break;
                    case 'tags':
                        //TODO manage content
                        state.prompt = undefined;
                        await context.sendActivity('Alright~ I\'ll save it forever and ever~');
                        //TODO: add undo
                        break;
                    default:
                        await context.sendActivity('I don\'t know what\'s going on!');
                        break;
                }
            }
        } else if (context.activity.type === 'conversationUpdate') {
            if (context.activity.membersAdded &&
                context.activity.membersAdded[0].id.includes(process.env.MICROSOFT_APP_ID)) {
                await context.sendActivity("Hello! I'm notetoself, the bot that will store and organize stuff you send to yourself!");
            }
        } else {
            await context.sendActivity("I don't understand what you're saying!");
        }
    });
});

const processMessage = (message, channel, convoType) => {
    if (channel === "msteams" && convoType === 'channel') {
        //+9 for the <at></at> tags
        message = message.slice(process.env.BOT_NAME.length+9, message.length);
    }

    return message.trim().toLowerCase();
}