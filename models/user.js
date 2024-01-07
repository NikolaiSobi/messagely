/** User class for message.ly */

const { DB_URI, BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const client = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const ExpressError = require("../expressError");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register(username, password, first_name, last_name, phone) {
    try {
      const hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
      const result = await client.query(
        `INSERT INTO users (
              username, 
              password, 
              first_name, 
              last_name, 
              phone,
              join_at,
              last_login_at) 
            VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE)
            RETURNING *`, 
        [username, hashedPw, first_name, last_name, phone])
          
      return result.rows[0]

    } catch (e) {
      throw new ExpressError(`Sorry could not register ${username}`, 404);
    }
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      const result = await client.query(
        `SELECT password 
         FROM users
         WHERE username=$1`, 
         [username])
      const user = result.rows[0]
      if(user){
        if(await bcrypt.compare(password, user.password) === true){
          return true
        }
        return false
      }
      throw new ExpressError("Invalid username/password", 400)
    } catch (e) {
      return next(e)
    }
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await client.query(
      `UPDATE users 
        SET last_login_at = current_timestamp
        WHERE username = $1
        RETURNING username, last_login_at`,
      [username])
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await client.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
          FROM users
          ORDER BY username`)
    return result.rows
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await client.query(
      `SELECT username, 
              first_name, 
              last_name, 
              phone, 
              join_at, 
              last_login_at
          FROM users 
          WHERE username = $1`,
      [username])
      
    return result.rows[0]
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await client.query(
      `SELECT m.id,
              m.to_username,
              u.first_name,
              u.last_name,
              u.phone,
              m.body,
              m.sent_at,
              m.read_at
          FROM messages AS m
          JOIN users AS u ON m.to_username = u.username
        WHERE from_username = $1`,
      [username])

    return result.rows.map(m => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }))
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id,
              m.from_username,
              u.first_name,
              u.last_name,
              u.phone,
              m.body,
              m.sent_at,
              m.read_at
        FROM messages AS m
         JOIN users AS u ON m.from_username = u.username
        WHERE to_username = $1`,
      [username]);

  return result.rows.map(m => ({
    id: m.id,
    from_user: {
      username: m.from_username,
      first_name: m.first_name,
      last_name: m.last_name,
      phone: m.phone,
    },
    body: m.body,
    sent_at: m.sent_at,
    read_at: m.read_at
  }));
}
}


module.exports = User;