const AWS = require('aws-sdk')
const dynamodbClient = require('dynamodb-client')

dynamodbClient.setAwsConfig({
  region: 'us-east-1'
})

const usersTable = new dynamodbClient.DynamoTable({
  tableName: 'usersTable',
  schema: {
    email: 'S',
    password: 'S',
  },
  primaryKey: 'email'
})

module.exports.getUsers = async (user) => {
  try {
    let userInfo = await usersTable.get(user.email)
    console.log('userInfo', userInfo)
    if (!userInfo.email) {
      return
    }
    return userInfo
  }
  catch (e) {
    console.log('error get', e)
    return e
  }
}


module.exports.create = async (user) => {
  try {
    

    let dynamoResult = await usersTable.add({
      email: user.email,
      password: user.password
    })
    console.log('dynamoResult', dynamoResult)
    return {
      email: user.email,
      password: user.password
    }
  }
  catch (e) {
    console.log('error create', e)
    return e
  }
}