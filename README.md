# Meetup Alexa Skill

A simple Alexa skill to get meetup information, built using the Serverless Framework and the [serverless-alexa-skills](https://github.com/marcy-terui/serverless-alexa-skills) plugin.

## Create the project

```
$ sls create -t aws-nodejs --name sls-meetup-alexa-skill -p sls-meetup-alexa-skill

Serverless: Generating boilerplate...
Serverless: Generating boilerplate in "/Users/wixmac/Projects/webapps/iot-project/sls-meetup-alexa-skill"
 _______                             __
|   _   .-----.----.--.--.-----.----|  .-----.-----.-----.
|   |___|  -__|   _|  |  |  -__|   _|  |  -__|__ --|__ --|
|____   |_____|__|  \___/|_____|__| |__|_____|_____|_____|
|   |   |             The Serverless Application Framework
|       |                           serverless.com, v1.30.1
 -------'

Serverless: Successfully generated boilerplate for template: "aws-nodejs"
```

## Add the Alexa skills plugin

```
$ sls plugin install -n serverless-alexa-skills
```

## Set up credentials

**Login with Amazon** is an OAuth2.0 single sign-on (SSO) system using your Amazon.com account.

Get your credentials, by logging into the [Amazon Developer Console](https://developer.amazon.com/). Then, go to **Login with Amazon** from **APPS & SERVICES** menu, and then click on **Create a New Security Profile**. Then, go to **Web Settings** menu item to create a new security profile.

Leave the `Allowed Origins` empty. Enter `http://localhost:9000` in `Allowed Return URLs`. 

Write down your `Client ID`, `Client Secret` and the `Vendor ID` for the new security profile. You can [find](https://developer.amazon.com/mycid.html) your `Vendor ID` as well. You can then set environment variables for each one of these secrets and then reference them in the `serverless.yml` file as shown below:

```
custom:
  alexa:
    vendorId: ${env:AMAZON_VENDOR_ID}
    clientId: ${env:AMAZON_CLIENT_ID}
    clientSecret: ${env:AMAZON_CLIENT_SECRET}
    localServerPort: 9000
```

## Authenticating with Amazon

```
$ sls alexa auth
```

## Create an Alexa Skill

```
$ sls alexa create --name $YOUR_SKILL_NAME --locale $YOUR_SKILL_LOCALE --type $YOUR_SKILL_TYPE
```
where:

* **name**: Name of the skill
* **locale**: Locale of the skill (`en-US` for English)
* **type**: Type of the skill (`custom` or `smartHome` or `video`)

In our case, to create a new Alexa skill, run:

```
$ sls alexa create --name MeetupEvents --locale en-US --type custom

Serverless: [Skill ID] amzn1.ask.skill.xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx
```
**Note**: The `Skill ID` for the newly created skill is printed out.

## Skill Manifest

The above command creates a `manifest`. View the `manifest` by running:

```
$ sls alexa manifests

Serverless:
----------------
[Skill ID] amzn1.ask.skill.xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx
[Stage] development
[Skill Manifest]
manifest:
  publishingInformation:
    locales:
      en-US:
        name: MeetupEvents
  apis:
    custom: {}
  manifestVersion: '1.0'
```

## Add Skill Configuration

In your `serverless.yml` file, add a new `skills` block and paste the `Skill ID` and the `manifest` section into it, as shown below:

```
custom:
  alexa:
    vendorId: ${env:AMAZON_VENDOR_ID}
    clientId: ${env:AMAZON_CLIENT_ID}
    clientSecret: ${env:AMAZON_CLIENT_SECRET}
    localServerPort: 9000
    skills:
      - id: amzn1.ask.skill.xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx
        manifest:
          publishingInformation:
            locales:
              en-US:
                name: MeetupEvents
          apis:
            custom: {}              
          manifestVersion: '1.0'
```

With the new information added, let's update the skill by running:

```
$ sls alexa update
```
**Note**: You can use the option `--dryRun` to simulate what the command will do intsead of actually doing anything.

## Build the Interaction Model

Let's add the interaction model for our skill in the `serverless.yml` file, as shown below:

```
        ...
        models:
          en-US:
            interactionModel:
              languageModel:
                invocationName: meetup events
                intents:
                  - name: MeetupIntent
                    samples:
                    - 'my events'
                    - 'my meetup events'
                    - 'anything interesting in my meetup'
                    - 'give me all my meetup events'
                  - name: AMAZON.HelpIntent
                    samples: []
                  - name: AMAZON.CancelIntent
                    samples: []
                  - name: AMAZON.StopIntent
                    samples: []
```

We will update the skill again by running:

```
$ sls alexa update
```

## Lambda Functions for the Intents

Before we go any further, we need to write our Lambda function handlers for our skill intents in the `index.js` file. Once we are done with that we need to reference those Lambda functions in the `serverless.yml` file as shown below:

```
functions:
  meetupHandler:
    handler: index.meetupHandler
    events:
      - alexaSkill: amzn1.ask.skill.xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx
```
**Note**: In this case, the Lambda functions are in the `index.js` file and the exported function is called `meetupHandler`.

Now, let's deploy our Alexa Meetup skill app.

## Deploy the Skill

The deploy command will zip up the code, and upload it to AWS. Then, it will map the function handler and give us an endpoint (ARN). 

```
$ cd sls-meetup-alexa-skill 
$ sls deploy

Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (1.7 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..................
Serverless: Stack update finished...
Service Information
service: sls-meetup-alexa-skill
stage: dev
region: us-east-1
stack: sls-meetup-alexa-skill-dev
api keys:
  None
endpoints:
  None
functions:
  meetupHandler: sls-meetup-alexa-skill-dev-meetupHandler
```

That was easy!!! No clicking through AWS console screens to deploy your Lambda functions.

Now, we need to get ARN for the Lambda function we just deployed. Go to the [AWS Lambda service](https://console.aws.amazon.com/lambda/) and search for the Lambda function `sls-meetup-alexa-skill-dev-meetupHandler`. On the top-right corner of the screen, you will see the ARN. 

Grab the ARN and add it to the `manifest` section of the `serverless.yml` file, as shown below:

```
...
          apis:
            custom:
              endpoint:
                uri: arn:aws:lambda:<AWS Region>:<AWS Account ID>:function:sls-meetup-alexa-skill-dev-meetupHandler
...
```
**Note:** Replace the `<AWS Region>` and `<AWS Account ID>` with real values for your AWS account.

## Build the Skill

We will update the skill again by running:

```
$ sls alexa update
```

And, finally we will build the Alexa skill.

```
$ sls alexa build
```
**Note**: You can use the option `--dryRun` to simulate what the command will do intsead of actually doing it.

## View the Interaction Model

Now that the skill has been built, we can see the interaction model, as follows:

```
$ sls alexa models

Serverless:
-------------------
[Skill ID] amzn1.ask.skill.xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxxxx
[Locale] en-US
[Interaction Model]
interactionModel:
  languageModel:
    invocationName: meetup events
    intents:
      - name: MeetupIntent
        samples:
          - my events
          - tmy meetup events
          - anything interesting in my meetup
          - give me all my meetup events
      - name: AMAZON.HelpIntent
        samples: []
      - name: AMAZON.CancelIntent
        samples: []
      - name: AMAZON.StopIntent
        samples: []
```

## Preview the Skill

Let's see what we have achieved so far. We have create a Alexa skill named MeetupEvents. Let's preview the skill we created on the Alexa Developer Console.

![image](https://user-images.githubusercontent.com/8188/44305288-fa291c00-a341-11e8-9dfa-cecaa83579e1.png)

After, the skill is built, we can see the Intents populated:

![image](https://user-images.githubusercontent.com/8188/44305357-46289080-a343-11e8-9ff8-506fe47b2265.png)

And, the MeetupIntent utterances are populated as well:

![image](https://user-images.githubusercontent.com/8188/44305376-9f90bf80-a343-11e8-8931-6b2423beeb38.png)

## Test the Skill

First enable testing for the skill. We will be using the Alexa Simulator to test our skill.

We start by typing **meetup events**, and we hear the welcome response.

Then, we type in **my events**, and we hear the list of events.

![image](https://user-images.githubusercontent.com/8188/44305392-3bbac680-a344-11e8-9660-114e70c02f39.png)

And, we have a working Alexa Skill that speaks out the latest meetup events.

## Logs

You can view the AWS CloudWatch logs from the terminal by running:

```
$ sls logs -f meetupHandler
```

## Cleanup

You can delete the Alexa skill, by:

```
$ sls alexa delete --id <skill_id>
```

and, you can also cleanup the Lambda function deploys to AWS, by:

```
$ sls remove
```