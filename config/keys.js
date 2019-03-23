module.exports ={
    // enter the uri for production mongodb 
    prod: process.env.DBURI|| 'mongodb://<username>:<password without special characters></passwordwithout>@ds024748.mlab.com:24748/myusers',
    // uri for mongodb installed locally, enter the database name
    home:'mongodb://localhost:27017/databasename',
    // enter your mailing service for node-mailer
    nodemailerService: process.env.nodemailerService||'Gmail',
    // enter your email address below
    EA: process.env.EA||'example@domain.com',
    // enter your password for nodemailer auth
    pass: process.env.pass||'password',
    //enter the port of your app 
    PORT:process.env.PORT||9000,
    PGP: ['-----BEGIN PGP PUBLIC KEY BLOCK-----…']
}