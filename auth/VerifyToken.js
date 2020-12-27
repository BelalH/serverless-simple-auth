const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  console.log('authResponse', authResponse)
  return authResponse;
}

module.exports.auth = (event, context, callback) => {
  try {
    // check header or url parameters or post parameters for token
    const token = event.authorizationToken.split(' ')[1];
    
    if (!token)
      return callback(null, 'Unauthorized');

    // verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err){
        console.log('err', err)
        return callback(null, 'Unauthorized');
      }
      console.log('decoded', decoded)
      // if everything is good, save to request for use in other routes
      return callback(null, generatePolicy(decoded.id, 'Allow', event.methodArn))
    });
  }
  catch (e) {
    console.log('something went wrong', e)
    return e
  }
};