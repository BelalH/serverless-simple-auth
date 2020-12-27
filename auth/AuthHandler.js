const userHandler = require('./user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs-then');

/* 
 * Functions
 */

module.exports.login = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  return login(JSON.parse(event.body))
    .then(session => ({
      statusCode: 200,
      body: JSON.stringify(session)
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: { stack: err.stack, message: err.message }
    }));
};

module.exports.register = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return register(JSON.parse(event.body))
    .then(session => ({
      statusCode: 200,
      body: JSON.stringify(session)
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message
    }));
};

module.exports.me = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('hereee')
  console.log(event.requestContext.authorizer.principalId)
  return me(event.requestContext.authorizer.principalId)
    .then(session => ({
      statusCode: 200,
      body: JSON.stringify(session)
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: { stack: err.stack, message: err.message }
    }));
};

/**
 * Helpers
 */

function signToken(id) {
  try {
    id = jwt.sign({ id: id , privateKey: 'reallystrongsecret'}, process.env.JWT_SECRET, {
      expiresIn: 86400 // expires in 24 hours
    });
    console.log('token', id)
  } catch (e) {
    console.log('sign token', e)
  }

  return id
}

function checkIfInputIsValid(eventBody) {
  if (
    !(eventBody.password &&
      eventBody.password.length >= 7)
  ) {
    return Promise.reject(new Error('Password error. Password needs to be longer than 8 characters.'));
  }

  // if (
  //   !(eventBody.name &&
  //     eventBody.name.length > 5 &&
  //     typeof eventBody.name === 'string')
  // ) return Promise.reject(new Error('Username error. Username needs to longer than 5 characters'));

  if (
    !(eventBody.email &&
      typeof eventBody.email === 'string')
  ) return Promise.reject(new Error('Email error. Email must have valid characters.'));

  return Promise.resolve();
}

function register(eventBody) {
  console.log(eventBody)
  return checkIfInputIsValid(eventBody) // validate input
    .then(() =>
      userHandler.getUsers({ email: eventBody.email }) // check if user exists
    )
    .then(user =>
      user
        ? Promise.reject(new Error('User with that email exists.'))
        : bcrypt.hash(eventBody.password, 8) // hash the pass
    )
    .then(hash =>
      userHandler.create({ email: eventBody.email, password: hash }) // create the new user
    )
    .then(user => ({ auth: true, token: signToken(user.email) })); // sign the token and send it back
}

async function login(eventBody) {
  return userHandler.getUsers({ email: eventBody.email })
    .then(user =>
      !user
        ? Promise.reject(new Error('User with that email does not exits.'))
        : comparePassword(eventBody.password, user.password, user.email)
    )
    .then(token => ({ auth: true, token: token }));
}

function comparePassword(eventPassword, userPassword, userId) {
  return bcrypt.compare(eventPassword, userPassword)
    .then(passwordIsValid =>
      !passwordIsValid
        ? Promise.reject(new Error('The credentials do not match.'))
        : signToken(userId)
    );
}

function me(userId) {
  return userHandler.getUsers({ email: userId })
    .then(user =>
      !user
        ? Promise.reject('No user found.')
        : user
    )
    .catch(err => Promise.reject(new Error(err)));
}