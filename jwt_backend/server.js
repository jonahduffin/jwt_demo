'use strict'

require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const crypto = require('crypto'); // used for md5 hashing during login
const jwt = require('jsonwebtoken'); // used for authentication and authorization

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
})


const users = {
    // 'password123'
    'jonah': {
        'id': 101,
        'pass_hash': '876bb587d239b3a53e536ac71c0bb9be30cd8031f740ce3cf0a1a17e6375d08d',
        'pass_salt': '12345',
        'is_admin': true
    },
    // 'pword54321'
    'guest': {
        'id': 102,
        'pass_hash': '2191839252ae716e18b34383b97bb88514dfa53e0a87458940522c0b24c32104',
        'pass_salt': '54321',
        'is_admin': false
    }
}

// create JWT middleware funciton
const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (token === null || token === 'null') {
        res.send({
            auth: false,
            errortype: 'notoken',
            msg: 'No access token provided'
        });
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.send({
                    auth: false,
                    errortype: 'badtoken',
                    msg: 'Failed to authenticate with provided token'
                });
            } else {
                req.id = decoded.id;
                req.username = decoded.username;
                req.is_admin = decoded.is_admin;
                next();
            }
        })
    }
}

const verifyJWTAdmin = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (token === null || token === 'null') {
        res.send({
            auth: false,
            errortype: 'notoken',
            msg: 'No access token provided'
        });
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.send({
                    auth: false,
                    errortype: 'badtoken',
                    msg: 'Failed to authenticate with provided token'
                });
            } else {
                if (!decoded.is_admin) {
                    res.send({
                        auth: false,
                        errortype: 'invalidrole',
                        msg: 'Admin permissions required for this resource'
                    });
                } else {
                    req.id = decoded.id;
                    req.username = decoded.username;
                    req.is_admin = decoded.is_admin;
                    next();
                }
            }
        })
    }
}

app.get('/api/auth/verify', verifyJWT, async(req, res) => {
    // if it passed through the middleware, token is valid and response can be sent
    res.send({
        auth: true,
        msg: 'Token still valid.'
    })
})

app.post('/api/auth/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!users.hasOwnProperty(username)) {
        res.send({
            auth: false,
            msg: 'Username not found!'
        });
    } else {
        const correct_hash = users[username]['pass_hash'];
        const sent_hash = crypto.createHmac("sha256", users[username]['pass_salt'])
                            .update(password).digest("hex");

        if (correct_hash === sent_hash) {
            const token = jwt.sign({
                // this is the body of the JSON web token
                    id: users[username]['id'],
                    username,
                    is_admin: users[username]['is_admin']
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: 3600 // token expires in 1 hour
                }
            );

            res.send({
                token,
                auth: true,
                msg: 'Authentication successful!'
            });
        } else {
            res.send({
                auth: false,
                msg: 'Username and password do not match!'
            });
        }
    }


});

app.get('/api/test', async (req, res) => {
    console.log('Request received!');
    console.log(crypto.createHmac("sha256", '54321')
    .update('pword54321').digest("hex"));
    res.send("Test response");
});

app.get('/api/messageoftheday', verifyJWT, async(req, res) => {
    res.send({
        message: "Did you know? Cat allergies originate from a protein found in cat saliva, not from cat hair itself."
    });
});

app.get('/api/secretmessage', verifyJWTAdmin, async (req, res) => {
    res.send({
        secretmessage: "Robert Pattinson is the best Batman yet."
    })
});

app.listen(5000, () => console.log(`Listening on port 5000`));