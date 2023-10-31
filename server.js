// using environment files
let env = require("dotenv").config();
// using express
let compression = require("compression");
let express = require("express");
let multer = require("multer");
let cookieParser = require("cookie-parser");
let sessions = require("express-session");
let MethOverRide = require("method-override");
let parser = require("body-parser");
let passport = require("passport");
let flash = require("connect-flash");
//var proxy = require('express-http-proxy');
let cors = require("cors");
const app = express();
const config = require("./config/keys.js");
let expressLayouts = require("express-ejs-layouts");
let port = config.PORT;
const expressValidator = require("express-validator");
let mongoose = require("mongoose");
let MongoStore = require("connect-mongo")(sessions); // for storing all the sessions in the database
//var fs = require('fs');
//var https = require('https');// the https modules for ssl and tls configuration to the app
//var

let helmet = require("helmet");
//var http = require('http')

// MIDDLEWARE IMPLEMENTATION SECTION
//using the compression middleware

//var  forcessl = require('express-force-ssl');
//  using Ejs and express layouts
app.set("view engine", "ejs");
app.use(expressLayouts);
//
app.use(cors());
app.use(compression());
app.use(cookieParser());
const ulrencodedParser = parser.urlencoded({ extended: true });
app.use(ulrencodedParser);
app.use(parser.json());

app.set("trust proxy", 1); // trust first proxy
app.use(
  sessions({
    secret: "enter secret", // add the secret to the key files in the config dir
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 50000,
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// Seting static files (css, images and libraries like bootstrap , jquery and p5js) location
app.use(express.static((__dirname = "./public")));
// static folder for webpack
app.use(express.static((__dirname = "./dist")));
// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("Success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  res.locals.users = req.users || null;
  next();
});
// database configuration
// database connection

mongoose
  .connect(config.prod, { useNewUrlParser: true })
  .then(() => {
    console.log("Database is  successfully connected!!");
  })
  .catch((err) => console.log(err));
//
let User = require("./lib/User-model");
let Photo = require("./lib/photo-schema");
// setting up express validator
app.use(expressValidator());
// connect flash setup
app.use(flash());

// error handling
/*
if (app.get('env') =='DEVELOPMENT') {

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('pages/error', {
        message: err.message,
        error: err
    });
  });

}
*/
// USING FORCE SSL MIDDLEWARE
//app.use(forcessl)
//ADDING HELMET MIDDLEWARE
app.use(helmet());
// setup multer
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
let fileFilter = function (req, file, cb) {
  const { mimetype } = file;
  console.log(file);
  console.log(typeof mimetype);
  let exp = /image/g;
  let testmatch = exp.test(mimetype);
  if (testmatch == true) {
    cb(null, true);
  } else {
    cb(new Error("file uploaded is not an image, upload only images files"));
  }
};
let upload = multer({ storage: storage, fileFilter: fileFilter }).single(
  "avatar",
);

module.exports = upload;

// route our app
let router = require("./app/routes");
let auth = require("./app/auth");
app.use("/", router);
app.use("/auth", auth);
process.on("exit", function (code) {
  console.log("bye bye" + code);
});
app.use(MethOverRide());

// error handling for production
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  console.log(req.originalUrl);
  if (req.url.includes("auth")) {
    res.json({ code: 404, message: "Resource not Found" });
  } else {
    res.render("pages/error", {
      error: { msg: `Opps, something wrong, contact your administrator` },
    });
  }
});

// adding route protection middleware

// USING EXPRESS-HTTP-PROXY MIDDLEWARE
//app.use('/proxy',proxy('www.google.com'))

// THE CODE BELOW IS FOR ADDING TLS encryption via the https
/* var options={
    key:fs.readFileSync('./tls/localhost.pem'),// directory with the private key generated
    cert:fs.readFileSync('./tls/localhost.crt'),// path to the certificate 
    requestCert:false,
    rejectUnauthorized:false,
    ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES256-SHA384',
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'

}
 */

app.listen(port, function () {
  console.log("app started at port  " + port);
});
// the https service only use to add the tls during production environment with the domain name set
//var server =https.createServer(options, app).listen(443)
//  the syntax below  is forusing localtunnel as a modules, use lt globally
/*var localtunnel =
require('localtunnel');
 let opts =[{subdomain:'maxdel'}]
 var tunnel =
localtunnel(port,opts, function(err,
tunnel) {
    if (err) throw err;
    // the assigned public url for
    // i.e.
//https://abcdefgjhij.localtunnel.me
    //tunnel.url;
console.log('app tunnel open at '+ tunnel.url)
})
tunnel.on('close', function() {
    // tunnels are closed
console.log('tunnel is closed')
}) */
