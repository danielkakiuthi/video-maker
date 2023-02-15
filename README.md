# video-maker
Open-source project to make automated videos

Original Author: Filipe Deschamps

[Github of the original project](https://github.com/filipedeschamps/video-maker)

[Youtube Playlist of the original project](https://www.youtube.com/playlist?list=PLMdYygf53DP4YTVeu0JxVnWq01uXrLwHi)




The main steps that this code executes are:
1. Input
   - Ask the user for a **search term** and a **prefix**
2. text-robot
   - fetch content from Wikipedia
   - sanitize content
   - break content into sentences
   - limit maximum sentences
   - fetch keywords of all sentences (using IBM's Watson API)
3. image-robot
   - fetch images of all sentences
   - download all images (using Google Images API)
4. video-robot
   - convert all images
   - create all sentence images
   - create Youtube thumbnail
   - renderVideo (using videoshow ffmpeg)
5. youtube-robot
   - authorize with OAuth
   - upload video (using Youtube API)
   - upload thumbnail


# Credentials format

## API: Watson ##

To use Watson`s API, you will need to:
- create an account on [IBM Cloud](https://cloud.ibm.com/);
- create a **Natural Language Understanding** service;
- generate **Service Credentials**;

In the **/credentials** folder, create a file `watson-nlu.json` with the generated Service Credentials. A template of this file is shown below:

```
{
  "apikey": "...",
  "iam_apikey_description": "...",
  "iam_apikey_name": "...",
  "iam_role_crn": "...",
  "iam_serviceid_crn": "...",
  "url": "..."
}

```
> Ps.: At the time this project was created, there is a quota limit of 30,000 NLU Items Per Month without incurring any costs (Lite plan). 


## API: Google Search ##
To use Google Search API, you will need to:
- login to [Google Cloud APIs & Services](https://console.cloud.google.com/);
- create a **project**;
- enable the **Custom Search API**;
- create credentials as an **API key**;

In the **/credentials** folder, create a file `google-search.json` with the generated API key credential. A template of this file is shown below:

```
{
    "apiKey": "...",
    "searchEngineId": "...",
    "publicUrl": "..."
}
```
> Ps.: At the time this project was created, there is a quota limit of 100 queries per day without incurring any costs.

## API: Youtube ##
To use the Youtube API, you will need to:
- login to [Google Cloud APIs & Services](https://console.cloud.google.com/);
- create a **project**;
- enable the **YouTube Data API v3**;
- create credentials as an **OAuth client ID**;
- set credential type as **Web Application**;
- set **Authorize JavaScript Origins** at URI: http://localhost:5000;
- set **Authorized redirect URIs** at URI: http://localhost:5000/oauth2callback;
- if your app is in "testing" status you may need to **add Test users** that will do the OAuth2 authorization

In the **/credentials** folder, create a file `google-youtube.json` with the generated OAuth2.0 Client ID credential. A template of this file is shown below:

```
{"web":
    {"client_id":"...",
    "project_id":"...",
    "auth_uri":"...",
    "token_uri":"...",
    "auth_provider_x509_cert_url":"...",
    "client_secret":"...",
    "redirect_uris":["..."],
    "javascript_origins":["..."]
    }
}
```
> Ps.: At the time this project was created, there is a quota limit of 10000 units per day without incurring any costs. Google calculates your quota usage by assigning a cost to each request. For more information visit [YouTube Data API documentation](https://developers.google.com/youtube/v3/getting-started).


# Run Code
```
cd video-maker
npm install
node index.js
```
Provide a **Search Term** and a **prefix**.

> Ps.: For the youtube-robot, you will need to access the OAuth2 link provided on terminal to authorize the upload on your Youtube Channel.
