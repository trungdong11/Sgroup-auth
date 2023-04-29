const express = require('express');
const JsonWebToken = require('jsonwebtoken');
var router = express.Router();

require('dotenv').config();

const db = require('../database/connection')

const {hashPassword, hashPasswordLogin} = require('../helpers/hash');

const SECRET = process.env.SECRET_KEY;


router.post('/register', async (req, res) => {

    //get data from request body
const {
    username, 
    password,
    name, 
    age, 
    email,
    gender,
} = req.body;

db.query(
    `SELECT * FROM users WHERE username = ?`,
    username,
    (err, rows) => {
        if(err) {
            return res.status(500).json({
                message: 'Internal server error1'
            })
        }
        
        const user = rows[0];
        
        //username is already taken 
        if(user)
        {
            return res.status(400).json({
                message: 'User already taken',
            })
        }

        const {
            hashedPassword,
            salt, 

        } = hashPassword(password)

        db.query (
            `INSERT INTO users(username,name, salt, password, age, email, gender)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                username, 
                name, 
                salt, 
                hashedPassword,
                age, 
                email,
                gender
            ], 
            (err, rows) => {
                if(err)
                {
                    console.log(err)
                    return res.status(500).json({
                        message: 'Internal Server error',
                    })
                }
                return res.status(201).json({
                    message: 'Register successfully',
                })
            }
        )
    }
)

})


router.post('/login', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    db.query(
        `SELECT * FROM users WHERE username = ?`,
        username,
        (err, rows) => {
            if(err) {
                return res.status(500).json({
                    message: 'Internal Server error',
                })
            }

            const user = rows[0];
            // console.log(user)
            if(!user)
            {
                return res.status(400).json({
                    message: 'User not found',
                });
            }
            
            const hashedPassword = hashPasswordLogin(password, user.salt)
            // console.log(hashedPasswordLogin)
            if(user.password === hashedPassword)
            {
                const jwt = JsonWebToken.sign({
                    username: user.username,
                    name: user.name,
                    age: user.age,
                    gender: user.gender,
                    email: user.email
                }, SECRET, {
                    algorithm: 'HS256', 
                    expiresIn: '1h',
                });
                
                return res.status(200).json({
                    data: jwt,
                    message: 'Login successful',
                });
            }
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }
    )
})

module.exports = router;