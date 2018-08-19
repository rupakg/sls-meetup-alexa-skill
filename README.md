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

To get your credentials, log in to the [Amazon Developer Console](https://developer.amazon.com/), go to **Login with Amazon** from **APPS & SERVICES** menu, and then click on **Create a New Security Profile**.

Go to the **Web Settings** for the new security profile.

`Allowed Origins` can be empty. 
Enter http://localhost:9000 in `Allowed Return URLs`. 

Write down your `Client ID` and `Client Secret` for the new security profile, as well as `Vendor ID`. You can find your `Vendor ID` at [here](https://developer.amazon.com/mycid.html). You can then set environment variables for each one of these secrets and then reference them in the `serverless.yml` file as shown below:

```
custom:
  alexa:
    vendorId: ${env:AMAZON_VENDOR_ID}
    clientId: ${env:AMAZON_CLIENT_ID}
    clientSecret: ${env:AMAZON_CLIENT_SECRET}
    localServerPort: 9000
```
**Note**: If you change the port number from the default `3000`, then make sure to add an attribute of `localServerPort` to the `custom` block in the `serverless.yml` file.

## Authenticating with Amazon

```
$ sls alexa auth
```

This command opens the  Amazon.com login page in your browser. You will be redirected to `localhost:9000` after authenticating. If the authentication is successful, you'll see the message: "Thank you for using Serverless Alexa Skills Plugin!!".

**Note**: The security token expires in 1 hour. Therefore, if an authentication error occurs, please re-execute the command.

## Create an Alexa Skill

```
$ sls alexa create --name $YOUR_SKILL_NAME --locale $YOUR_SKILL_LOCALE --type $YOUR_SKILL_TYPE
```
where:

* **name**: Name of the skill
* **locale**: Locale of the skill (`en-US` for English, `ja-JP` for Japanese etc.)
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
**Note**: If you have other skills present, the info about those skills will be shown as well. 

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
For details, check out the [full specs](https://developer.amazon.com/docs/smapi/skill-manifest.html#sample-skill-manifests) for the manifest.

Now, to update the skill, run:

```
$ sls alexa update
```
**Note**: You can use the option `--dryRun` to simulate what the command will do intsead of actually doing it.

## Build the Interaction Model

We will now write an interaction model for our skill in the `serverless.yml` file, as shown below:

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
                    - 'tmy meetup events'
                    - 'anything interesting in my meetup'
                    - 'give me all my meetup events'
                  - name: AMAZON.HelpIntent
                    samples: []
                  - name: AMAZON.CancelIntent
                    samples: []
                  - name: AMAZON.StopIntent
                    samples: []
```
For details, check out the [full specs](https://developer.amazon.com/docs/custom-skills/custom-interaction-model-reference.html) for the interaction model.

We will update the skill again by running:

```
$ sls alexa update
```

## Lamda Functions for the Intents

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

That was easy!!! No clicking through AWS screens to deploy your Lambda functions.

**Note**: For some reason (still investigating), the ARN does not get printed under the `endpoints` in the output above. So, go to the [AWS Lambda service](https://console.aws.amazon.com/lambda/) and search for the Lambda function `sls-meetup-alexa-skill-dev-meetuphandler`. On the top-right corner of the screen, you will see the ARN. 

Grab the ARN and add it to the `manifest` section of the `serverless.yml` file, as shown below:

```
...
          apis:
            custom:
              endpoint:
                uri: arn:aws:lambda:region:account_id:function:sls-meetup-alexa-skill-dev-meetupHandler
...
```

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

## Preview the Skill on Alexa Developer Console

Let's see what we have achieved so far. We have create a Alexa skill named MeetupEvents.

![image](https://user-images.githubusercontent.com/8188/44305288-fa291c00-a341-11e8-9dfa-cecaa83579e1.png)

After, the skill is built, we can see the Intents populated:

![image](https://user-images.githubusercontent.com/8188/44305357-46289080-a343-11e8-9ff8-506fe47b2265.png)

And, the MeetupIntent utterances are populated as well:

![image](https://user-images.githubusercontent.com/8188/44305376-9f90bf80-a343-11e8-8931-6b2423beeb38.png)

## Test the Skill

First enable testing for the skill.

We start by typing **meetup events**, and we hear the welcome response.

Then, we type in **my events**, and we hear the list of events.

![image](https://user-images.githubusercontent.com/8188/44305392-3bbac680-a344-11e8-9660-114e70c02f39.png)

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

and, you can also cleanup the Lambda function deployment frm AWS, by:

```
$ sls remove
```