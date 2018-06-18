'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('44534792b79a4672a9356bf8a45eb3b3');
const server = express();

server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(bodyParser.json());

server.get('/news', function (req, res) {
    const query = req.query.query;
    newsapi.v2.topHeadlines({
        q: query || 'dogs',
        sources: 'abc-news, buzzfeed, cbs-news, cnbc, cnn, daily-mail, entertainment-weekly, espn, fox-news, nbc-news, the-wall-street-journal, the-washington-post, time, usa-today',
    }).then(response => {
        let responseToSend;
        if (response.status === 'ok' && response.articles.length > 0) {
            const articles = response.articles.map(article => {
                return {
                    "title": article.title,
                    "image_url": article.urlToImage,
                    "subtitle": article.description,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": article.url,
                            "title": "Read Full Article"
                        }
                    ]
                }
            })
            responseToSend = {
                "messages": [
                    {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "image_aspect_ratio": "square",
                                "elements": articles.slice(0, 10)
                            }
                        }
                    }
                ]
            };
            return res.json(responseToSend);
        } else {
            responseToSend = {
                "messages": [
                    { "text": `Opps! Looks like I don't have any articles on ${query} as of now.` },
                    { "text": "Please feel free to check back later or try searching for another topic." }
                ]
            }
            return res.json(responseToSend);
        }
    }, (error) => {
        responseToSend = {
            "messages": [
                { "text": `Opps! Something went wrong while searching for articles on ${query}.` },
                { "text": `Got this error: ${error}` }
            ]
        }
        return res.json(error);
    });
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});
