const express = require("express")
const router = express.Router()
const user = require("../models/user")
const jwt = require("jsonwebtoken")
const client = require("../db.js")
const { DB_URI, SECRET_KEY } = require("../config.js")



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body

        if(await user.authenticate(username, password)){
            let token = jwt.sign({username}, SECRET_KEY)
            user.updateLoginTimestamp(username)
            return res.json({token})
        }
        return res.status(404).send("sorry invalid username/password")
    } catch (error) {
        return next(error)
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body
        const registerUser = await user.register(username, password, first_name, last_name, phone)

        if(await user.authenticate(username, password)){
            let token = jwt.sign({username}, SECRET_KEY)
            return res.json(token)
        } 
        
    } catch (error) {
        return res.status(404).send("sorry username taken, please try again")
    }

})

module.exports = router