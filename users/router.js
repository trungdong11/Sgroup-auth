const express = require('express');
const JsonWebToken = require('jsonwebtoken');
var router = express.Router();

const db = require('../database/connection')

const {hashPassword, hashPasswordLogin} = require('../helpers/hash');

const SECRET = 'my-secret';
const app = express();
app.use(express.json());

router.put('/:id',  (req, res, next) => {
    const {name, age, gender} = req.body;
    const id = req.params.id;
    const username = req.query.username;
    console.log(username)

    const authorizationHeader = req.headers.authorization;
    console.log(authorizationHeader)
    const userToken = authorizationHeader.substring(7);
    console.log(userToken)

    try {
        const isTokenValid = JsonWebToken.verify(userToken, SECRET);
        console.log(isTokenValid.username)
        
        // Authorization success
        if (isTokenValid.username == username) {
            db.query(`UPDATE users SET name = ?, age = ?, gender = ? WHERE id = ?`, [name, age, gender, id], (err, result) => {
                if(err) {
                    return res.status(500).json({
                        message: 'Internal Server Error',
                    })
                }

                if(result.affectedRows === 0) {
                    return res.status(400).json({
                        message: "Not Found"
                    })
                }

                const updateUser = {
                    id,
                    name, 
                    age, 
                    gender
                }
                res.status(200).json({
                    data: updateUser, 
                    message: 'Update successful'
                })
            })
        }
        
    } catch (error) {
        return res.status(401).json({
            message: error.message,
        });
    }

    
})


module.exports = router;



