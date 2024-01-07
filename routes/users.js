const express = require("express")
const router = express.Router()
const user = require("../models/user")
const client = require("../db")

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', async (req, res, next) => {
    try {
        return res.json(await user.all())
    } catch (error) {
        return next(error)
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', async (req, res, next) => {
    try {
        const username = req.params.username
        const result = await user.get(username)

        return res.json(result)
    } catch (error) {
        return next(err)
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', async (req, res, next) => {
    try {
        const username = req.params.username
        let result = await user.messagesTo(username)

        return res.json(result)
    } catch (error) {
        return next(error)
    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', async (req, res, next) => {
    try {
        const username = req.params.username
        const result = await user.messagesFrom(username)

        return res.json(result)
    } catch (error) {
        return next(error)
    }
})

module.exports = router