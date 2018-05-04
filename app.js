const botbuilder = require('botbuilder');
const restify = require('restify');
require('dotenv').config();
const DBHandler = require('./middleware/DbHandler');

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

const dbHandler = new DBHandler(conversationState);
adapter.use(dbHandler);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            const message = processMessage(context.activity.text, context.activity.channelId, context.activity.conversation.conversationType);
            const convoState = conversationState.get(context);
            if (!convoState.prompt) {
                if (message === 'save') {
                    convoState.prompt = 'type';
                    convoState.newContent = {};
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
                switch(convoState.prompt) {
                    case 'type':
                        convoState.prompt = 'content';
                        convoState.newContent.contentType = message;
                        await context.sendActivity('Great! Now please send me the content you want to save');
                        break;
                    case 'content':
                        convoState.prompt = 'tags';
                        convoState.newContent.content = message;
                        await context.sendActivity('Thank you! What do you want to tag this as? Please enter a comma-deliminated list');
                        break;
                    case 'tags':
                        convoState.prompt = undefined;
                        convoState.newContent.tags = processTags(message);
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

const processTags = (tags) => {
    const tagsAry = tags.split(",");
    const finalTags = tagsAry.map(tag => tag.trim().toLowerCase());
    return finalTags;
}