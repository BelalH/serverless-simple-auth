# serverless-simple-auth
This code will quickly generate Login and Registration API using API gateway, lambda and dynamodb 

The serverless code is going to create dynamodb, lambda and API gateway 

Functions:
* Register: allow users to send their username and password saving them in Dynamodb after hashing the password, return a JWT token as a response
* login: match username and password with the user in dynamodb, return JWT token as a response 
* Me: used as an example to test the JWT token to check, return user information 
* Validate Token: a function that API Gateway will automatically call the check if the token is valid or not 

Add serverless library
```
npm install serverless -g
```

Install dependencies 
```
npm install
```
![alt text](https://github.com/BelalH/serverless-simple-auth/blob/master/auth-service.png)



Applying this 
[blog](https://www.serverless.com/blog/strategies-implementing-user-authentication-serverless-applications) implementation, adding Dynamodb as the main DB instead of MongoDB
