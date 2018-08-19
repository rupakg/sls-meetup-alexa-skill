'use strict';

const Alexa = require('ask-sdk-core');
const https = require('request');

const MEETUP_API_KEY = process.env.MEETUP_API_KEY;
const SKILL_NAME = 'Meetup Events';
const MEETUP_URL = `https://api.meetup.com/desiconnections/events?key=${MEETUP_API_KEY}&sign=true`;

// Handlers
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = `Welcome to ${SKILL_NAME}. You can get all meetup events by saying my events`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(SKILL_NAME, speechText)
            .getResponse();
    }
};

const MeetupIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MeetupIntent';
    },
    async handle(handlerInput) {
        let speechText = '';
        let url = MEETUP_URL;
        
        var options = { json: true };
        
        try {
            speechText = await httpGet(url, options);
            console.log(`Meetup Events: ${speechText}`);            
        } catch (error) {
            speechText = error.message;
            console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error.message}`);
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(SKILL_NAME, speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;            
        console.log(`Request Type: ${request.type}`);
        console.log(`Intent: ${request.intent.name}`);    
        return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can get all meetup events by saying my events';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(SKILL_NAME, speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;    
        console.log(`Request Type: ${request.type}`);
        console.log(`Intent: ${request.intent.name}`);
        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent'
            || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(SKILL_NAME, speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;    
        console.log(`Request Type: ${request.type}`);
        console.log(`Intent: ${request.intent.name}`);
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);
      return handlerInput.responseBuilder
        .speak('Sorry, I can\'t understand the command. Please say again.')
        .reprompt('Sorry, I can\'t understand the command. Please say again.')
        .getResponse();
    },
};

// helper methods
function httpGet (url, options) {
    return new Promise (function (resolve, reject) {
        let meetupEvents = 'Here are the events in the group.';
        const space = ' ';
        const comma = ',';
        const period = '.';
        
        https (url, options, (err, res, body) => {
            if (err) { 
                console.log ("Error retrieving data from Desi Connnections Meetup");
                reject (new Error ("Error retrieving data from Desi Connections Meetup"));
            }
            console.log (body.url);
            console.log (body);
            
            let i = 1;
            body.forEach( function (body) {
                meetupEvents += space + 'Event ' + i + space;
                meetupEvents += body.name + comma + space;
                meetupEvents += body.local_date + period;
                i++;
            });
            console.log(meetupEvents);
            resolve (meetupEvents);
        });
    });
} 

// export the handlers
exports.meetupHandler = Alexa.SkillBuilders.custom()
     .addRequestHandlers(LaunchRequestHandler,
                         MeetupIntentHandler,
                         HelpIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda();
