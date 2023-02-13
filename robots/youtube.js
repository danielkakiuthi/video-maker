const express = require('express')
const google = require('googleapis').google
const youtube = google.youtube({version:'v3'})
const OAuth2 = google.auth.OAuth2
const state = require('./state.js')
const fs = require('fs')


async function robot() {
    const content = state.load()

    await authenticateWithOAuth()
    const videoInformation = await uploadVideo(content)
    await uploadThumbnail(videoInformation)


    async function authenticateWithOAuth() {
        const webServer = await startWebServer()
        const OAuthClient = await createOAuthClient()
        requestUserConsent(OAuthClient)
        const authorizationToken = await waitForGoogleCallback(webServer)
        await requestGoogleForAccessTokens(OAuthClient, authorizationToken)
        await setGlobalGoogleAuthentication(OAuthClient)
        await stopWebServer(webServer)

        async function startWebServer() {
            return new Promise((resolve, reject) => {
                const port = 5000
                const app = express()

                const server = app.listen(port, () => {
                    console.log(`> [robot-youtube] Listening on http://localhost:${port}`)
                    resolve({
                        app,
                        server
                    })
                })
            })
        }

        async function createOAuthClient() {
            const credentials = require('../credentials/google-youtube.json')
            
            const OAuthClient = new OAuth2(
                clientId = credentials.web.client_id,
                clientSecret = credentials.web.client_secret,
                redirectUri = credentials.web.redirect_uris[0]
            )

            return OAuthClient
        }

        function requestUserConsent(OAuthClient) {
            const consentUrl = OAuthClient.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube']
            })
            console.log(`> [robot-youtube] Please give your consent:\n${consentUrl}`)
        }

        async function waitForGoogleCallback(webServer) {
            return new Promise((resolve, reject) => {
                console.log('> [robot-youtube] Waiting for user consent...')

                webServer.app.get('/oauth2callback', (req,res) => {
                    const authCode = req.query.code
                    console.log(`> [robot-youtube] Consent given: ${authCode}`)
                    res.send('<h1> Thank you!</h1><p>Now close this tab.</p>')
                    resolve(authCode)
                })
            })
        }

        async function requestGoogleForAccessTokens(OAuthClient, authorizationToken) {
            return new Promise((resolve, reject) => {
                OAuthClient.getToken(authorizationToken, (error, tokens) => {
                    if (error) {
                        return reject(error)
                    }
                    console.log('> [robot-youtube] Access tokens received:')
                    console.log(tokens)

                    OAuthClient.setCredentials(tokens)
                    resolve()
                })
            })
        }

        async function setGlobalGoogleAuthentication(OAuthClient) {
            google.options({
                auth: OAuthClient
            })
        }

        async function stopWebServer(webServer) {
            return new Promise((resolve, reject) => {
                webServer.server.close(() => {
                    resolve()
                })
            })
        }
    }


    async function uploadVideo(content) {
        const videoFilePath = './content/output.mov'
        const videoFileSize = fs.statSync(videoFilePath).size
        const videoTitle = `${content.prefix} ${content.searchTerm}`
        const videoTags = [content.searchTerm, ...content.sentences[0].keywords]
        const videoDescription = content.sentences.map((sentences) => {
            return sentences.text
        }).join('\n\n')

        const requestParameters = {
            part: 'snippet, status',
            requestBody: {
                snippet: {
                    title: videoTitle,
                    description: videoDescription,
                    tags: videoTags
                },
                status: {
                    privacyStatus: 'unlisted'
                }
            },
            media: {
                body: fs.createReadStream(videoFilePath)
            }
        }

        const youtubeResponse = await youtube.videos.insert(requestParameters, {
            onUploadProgress: onUploadProgress
        })

        console.log(`> [robot-youtube] Video available at: https://youtu.be/${youtubeResponse.data.id}`)
        return youtubeResponse.data

        function onUploadProgress(event) {
            const progress = Math.round((event.bytesRead / videoFileSize) * 100)
            console.log(`> [robot-youtube] ${progress}% completed`)
        }
    }


    async function uploadThumbnail(videoInformation) {
        const videoId = videoInformation.id
        const videoThumbnailFilePath = './content/youtube-thumbnail.jpg'

        const requestParameters = {
            videoId: videoId,
            media: {
                mimeType: 'image/jpeg',
                body: fs.createReadStream(videoThumbnailFilePath)
            }
        }

        const youtubeResponse = await youtube.thumbnails.set(requestParameters)
        console.log('> [robot-youtube] Thumbnail uploaded!')
    }
}


module.exports = robot