// require express
var express = require("express");
// create the router object
var router = express.Router();

// adding the Body parser
var bodyParser = require("body-parser");
// use path
var path = require("path");

const { log } = console;
let mongoose = require("mongoose");
let photo = require("../lib/photo-schema");
let User = require("../lib/User-model");
let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let expressValidator = require("express-validator");
let flash = require("connect-flash");
let session = require("express-session");
let nodemailer = require("nodemailer");
let Encrypt = require("nodemailer-openpgp").openpgpEncrypt;
let config = require("../config/keys");
// import the upload middleware instance
let upload = require("../server");
// export the router
module.exports = router;

// NODE MAILER TRANSPORTER
const ea = config.EA;
const pass = config.pass;

//  NODE MAILER TRANSPORTER OBJECT
const transporter = nodemailer.createTransport({
  service: config.nodemailerService,

  auth: {
    user: config.EA,
    pass: config.pass,
  },
  // proxy configuration
  // proxy:'socks5://localhost:9000',
  logger: true, // log to console
  debug: true,
});
//transporter.set('proxy_socks_module', require('socks'))
transporter.use("stream", Encrypt());
router.all("/flash", function (req, res) {
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash("info", "Flash is back!");
  req.flash("invalid", "Invalid Username or password");
  req.flash("invalid_password", "Opps, Incorrect Password");
  res.redirect("/");
});

// route the app home page
router.get("/", function (req, res) {
  res.render("pages/index");
});
// ALL FORM ROUTING
const ulrencodedParser = bodyParser.urlencoded({ extended: false });
router.post("/about", ulrencodedParser, function (req, res) {
  console.log(req.body);

  res.render("pages/about", { qs: req.query });
});

// route for signup page//
router.get("/signup", function (req, res) {
  res.render("pages/signup", { title: "REGISTRATION PAGE" });
});

// handling the post request from the signup pages
router.post("/signup", ulrencodedParser, function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;
  // VALIDATION OF THE DATA BEFORE ITS INSERTED INTO THE DATABASE
  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();
  req
    .checkBody("email", "Email must between 10 and 100 characters long")
    .len(10, 100);

  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("password", "password is required").notEmpty();
  req
    .checkBody(
      "password",
      "passwords must be atleast 8 long and contain at least one number",
    )
    .isLength({ min: 8 })
    .matches(/\d/);
  req
    .checkBody(
      "password",
      "your password must contain atleast one lowercase and one Uppercase letter",
    )
    .matches(/[a-z]/)
    .matches(/[A-Z]/);
  req
    .checkBody("confpassword", "Passwords must match")
    .equals(req.body.password);
  // VALIDATION ERRORS TO RETURNED TO THE CLIENT-SIDE
  var errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors);
    res.redirect("/signup");
  } else {
    User.getUserByUsername(email, function (err, user) {
      if (err) {
        throw err;
      }
      if (user) {
        req.flash(
          "error_msg",
          "User already exits, if you have forgotten your password, return to home page and click on the forgotten password button ",
        );
        res.redirect("/signup");
      }

      if (!user) {
        var newUser = new User({
          name: name,
          username: email,
          password: password,
        });
        User.createUser(newUser, function (err, user) {
          if (err) throw err;
        });
        req.flash("Success_msg", "You are registered and can now login");
        res.render("pages/index", { success_msg: req.flash("Success_msg") });
      }
    });
  }
});

// Handling the authenticated user login from the homepage

passport.use(
  new LocalStrategy(
    {
      passReqToCallback: true,
      session: true,
    },

    function (req, username, password, done) {
      User.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        if (!user) {
          return done(null, false, req.flash("error_msg", "unknown user"));
        }
        User.comparePassword(password, user.password, function (err, isMatch) {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(
              null,
              false,
              req.flash("error_msg", "incorrect password"),
            );
          }
        });
      });
    },
  ),
);

// adding passport

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

// THE GET ROUTE FOR PROFILE PAGE
router.get("/profile", checkAuth, function (req, res) {
  photo.Findphoto(res.locals.user.username, function (err, photo) {
    if (err) {
      log(err);
    } else {
      res.render("pages/profile", { photo: photo });
    }
  });
});
// POST ROUTE FOR THE PROFILE PAGE
router.post(
  "/profile",
  ulrencodedParser,
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
    failureFlash: true,
  }),
);

//route for about page
router.get("/about", checkAuth, function (req, res) {
  res.render("pages/about");
});
// route for the contact page
router.get("/contact", function (req, res) {
  res.render("pages/contact");
});
router.post("/contact", function (req, res) {});
// THE LOG OUT ROUTE
router.get("/logout", function (req, res, next) {
  req.logout();
  delete req.authenticated;

  res.redirect("/");
});
// authorization middleware
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error_msg", "You are not logged in");
    res.redirect("/");
  }
}
// password reset authorization middleware
function passBy(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    return next();
  }
}

// GET ROUTE FOR THE FORGOTTEN PASSWORD

router.get("/forgot_pass", passBy, function (req, res) {
  res.render("pages/forgot");
});
//  POST ROUTE FOR THE CONTACT PAGE(INTERGRATED WITH NODE-MAILER), do this anytime
router.post("/forgot_pass", ulrencodedParser, function (req, res) {
  User.getUserByUsername(req.body.email, function (err, user) {
    if (err) throw err;
    if (!user) {
      req.flash("error_msg", "Unknown email, please signup");
      return res.redirect("/forgot_pass");
    } else {
      //  THE NODEMAILER TRANSPORTER OBJ

      // SETUP EMAIL DATA WITH UNICODE SYMBOLS
      var mailOptions = {
        from: ea,
        to: req.body.email,
        subject: "PASSWORD RESET FROM MAXDEL SITE ",
        text: "Hello there, this is a message from maxdel website",
        html: "<br><p> <strong>Read the instructions below on how to reset your password:</strong></p> <br> <ul><li> use this link below  </li> <br><li><a href='http://localhost:9000/pass_reset'> reset password </a></li>",
        encryptionKeys: config.PGP,
      };
      // SEND THE MAIL WITH DEFINED TRANSPORT OBJECT
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          req.flash("error_msg", "Opps !! connection failed, try again later");
          res.redirect("/forgot_pass");
        } else {
          req.flash(
            "Success_msg",
            `Reset instructions  have been sent to your email, check your inbox in a few minutes`,
          );
          res.redirect("/");
        }
      });
    }
  });
});
// GET ROUTE FOR THE PASSWORD RESET  PAGE
router.get("/pass_reset", passBy, function (req, res) {
  res.render("pages/pass");
});
// POST ROUTE FOR THE PASSWORD RESET PAGE
router.post("/pass_reset", ulrencodedParser, function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;
  req.checkBody("password", "password is required").notEmpty();
  req
    .checkBody(
      "password",
      "passwords must be atleast 8 long and contain at least one number",
    )
    .isLength({ min: 8 })
    .matches(/\d/);
  req
    .checkBody(
      "password",
      "your password must contain atleast one lowercase and one Uppercase letter",
    )
    .matches(/[a-z]/)
    .matches(/[A-Z]/);

  req
    .checkBody("confpassword", "Passwords must match")
    .equals(req.body.password);
  // VALIDATION ERRORS TO RETURNED TO THE CLIENT-SIDE
  var errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors);
    res.redirect("/pass_reset");
  } else {
    User.getUserByUsername(email, function (err, user) {
      if (err) throw err;
      if (!user) {
        req.flash("error_msg", "Unknown user ");
        return res.redirect("/pass_reset");
      } else {
        User.changedinfo(email, password, function (err, changed) {
          if (err) throw err;
          else {
            req.flash("Success_msg", " login with new password created");
            res.redirect("/");
          }
        });
      }
    });
  }
});
// POST ROUTE FOR THE CONTACT PAGE
router.post("/contact-us", ulrencodedParser, function (req, res) {
  var email = req.body.email;
  var subject = req.body.subject;
  var name = req.body.name;
  var message = req.body.message;
  // BACKEND FORM VALIDATION  TO PREVENT SENDING EMPTY MESSAGES
  req.checkBody("name", "Full name is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();
  req
    .checkBody("email", "Email must between 10 and 100 characters long")
    .len(10, 100);
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("message", "Opps, no empty messages accepted").notEmpty();
  // VALIDATION ERRORS
  var errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors);
    res.redirect("/contact");
  } else {
    var mailopts = {
      from: email,
      to: ea,
      subject: subject,
      text: message,
      encryptionKeys: config.PGP,
    };
    transporter.sendMail(mailopts, function (error, info) {
      if (error) {
        req.flash("error_msg", ` Opps,connection failed, try again later`);
        res.redirect("/contact");
      } else {
        let msg = `Hello ${name}  your message was successful recieved, we will get back to  me as soon as possible`;
        req.flash("success_msg", msg);
        res.redirect("/contact");
      }
    });
  }
});
// GET ROUTE FOR THE DELETE
router.get("/delete", function (req, res) {});
// POST ROUTE FOR DELETING USER FROM DATABASE
router.post("/delete", ulrencodedParser, function (req, res) {
  var username = req.body.name;
  if (username === res.locals.user.username) {
    photo.Deletephoto(username, function (err, done) {
      if (err) {
        console.log(err);
      } else {
        User.deleteUser(username, function (err, done) {
          if (err) {
            console.log(err);
          }

          if (done) {
            req.logout();

            req.flash("Success_msg", "Account Deleted Successfully");
            res.redirect("/");
          }
        });
      }
    });
  } else {
    req.flash(
      "error_msg",
      "Failed to delete account ;try again and retype in password",
    );
    res.redirect("/contact");
  }
});
// HANDLE THE UPLOADS FROM THE CLIENT
router.post("/uploads", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      req.flash("error_msg", err.message);
      res.redirect("/profile");
    } else if (req.file !== undefined) {
      let { username } = res.locals.user;
      let { path } = req.file;
      let photopath = path.replace(/public/, "");

      photo.Findphoto(username, (err, isfound) => {
        if (err) {
          console.log(err);
        }
        if (isfound) {
          req.flash("error_msg", `the user's profile image only exists`);
          res.redirect("/profile");
        } else {
          photo.Savephoto(username, photopath, (err, img) => {
            if (err) {
              console.log(err);
            } else {
              res.redirect("/profile");
              log(
                `${res.locals.user.name} has added a new photoimage at ${img.photoPath}`,
              );
            }
          });
        }
      });
    } else {
      req.flash("error_msg", `dont submit empty files`);
      res.redirect("/profile");
    }
  });
});
//  ROUTE FOR ERROR HANDLING
router.get("/error", (req, res) => {
  res.render("pages/error");
});
const admin = require("./adminAuth");
router.get("/admin", checkAuth, admin, function (req, res) {
  User.collectedinfo((err, users) => {
    if (err) throw err;

    res.render("pages/project", { users: users });
  });
});
// ROUTE TO UPDATE THE PROFILE IMAGE
router.post("/updatephoto", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      req.flash("error_msg", err.message);
      res.redirect("/profile");
    } else if (req.file !== undefined) {
      let { username } = res.locals.user;
      let photopath = req.file.path.replace(/public/, "");
      photo.Updatephoto(username, photopath, function (err) {
        if (err) {
          log(err);
        } else {
          let mypath = req.file.path.replace(/public/, "");
          res.render("pages/profile", { photo: mypath });
        }
      });
    } else {
      req.flash("error_msg", `don't submit empty files`);
      res.redirect("/profile");
    }
  });
});
