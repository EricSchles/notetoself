const botbuilder = require('botbuilder');
const restify = require('restify');
require('dotenv').config();

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


// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            const message = processMessage(context.activity.text, context.activity.channelId);
            await context.sendActivity(message);
        } else if (context.activity.type === 'conversationUpdate') {
            if (context.activity.membersAdded &&
                context.activity.membersAdded[0].id.includes(process.env.MICROSOFT_APP_ID)) {
                await context.sendActivity("Hello! I'm notetoself, the bot that will store and organize stuff you send to yourself!");
            }
        }
    });
});

const processMessage = (message, channel) => {
    if (channel === "msteams") {
        //+9 for the <at></at> tags
        message = message.slice(process.env.BOT_NAME.length+9, message.length);
    }

    return message.trim().toLowerCase();
}