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
            await context.sendActivity(context.activity.text);
        } else if (context.activity.type === 'conversationUpdate') {
            if (context.activity.membersAdded &&
                context.activity.membersAdded[0].id.includes(process.env.MICROSOFT_APP_ID)) {
                await context.sendActivity("Hello! I'm notetoself, the bot that will store and organize stuff you send to yourself!");
            }
        }
    });
});