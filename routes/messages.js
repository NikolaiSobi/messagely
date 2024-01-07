const express = require("express")
const router = express.Router()
const message = require("../models/message")
const { SECRET_KEY } = require("../config")
const jwt = require("jsonwebtoken")
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth")


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const result = message.get(req.params.id)
        return res.json(result)
    } catch (error) {
        return next(error)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureCorrectUser, async (req, res, next) => {
    try {
        const { from_username, to_username, body } = req.body
        const result = await message.create(from_username, to_username, body)
        return res.json(result)
    } catch (error) {
        return next(error)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        const result = message.markRead(id)
        return res.json(result)
    } catch (error) {
        return next(error)
    }
})

module.exports = router