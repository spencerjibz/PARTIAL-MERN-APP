# MERNAPP
 THIS IS A HYBRID APP WITH BOTH A CRUD LAYER AND A REST API FOR REACT. ITS A COMPLETE HACK INTO MERN STACK WITHOUT USING TWO DIFFERENT SERVERS (ONE FOR BACKEND AND THE OTHER FOR CLIENT). THIS APP USES BOTH EJS AND JSX . WEBPACK IS MODULE BUNDLER USED FOR THIS PROJECT 
## Requirements

- MongoDB (local/remote) 

- Email account for nodemailer

- Nodejs

## Application Specs
- sends emails using nodemailer
- uses both ejs and react(jsx) 
- authentication and authorization is supported using passport and express auth middleware
- mongoose ODM for mongodb
- fs module for used to manage some files (profile page)
- os module for get platform information used to edit directorypaths specific to each platform
- Hybrid App with both CRUD and an API for react client
- Media player and webcam in the projects page 

## Usage
 1 .**[checkout the LiveDemo](https://hidden-earth-45154.herokuapp.com/)**
 
 2 .**For copy of the app**
 
 - clone the repo or download zipped folder
 
  ``` git clone https://github.com/spencerjibz/MERNAPP.git && cd MERNAPP && npm install ```
- Edit the keys.js file in the config folder, add  the mongodb uri and the email credentials
```
/config/keys.js

module.exports ={
    // enter the uri for production mongodb 
    prod: process.env.DBURI|| 'mongodb://<username>:<password without special characters>@hostname',
    // uri for mongodb installed locally, enter the database name
    home:'mongodb://localhost:27017/databasename',
    // enter your mailing service for node-mailer
    nodemailerService: process.env.nodemailerService||'Gmail',
    // enter your email address below
    EA: process.env.EA||'example@domain.com',
    // enter your password for nodemailer auth
    pass: process.env.pass||'password',
    //enter the port of your app 
    PORT:process.env.PORT||9000
}



```
 + >> Start the App using command below and check it out at [http://localhost:9000](http://localhost:9000)
 
 ``` npm start ```
 
 3. **sign up, login and checkout all the features** 
