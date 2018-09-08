//requirements to run app
var express               = require('express');
var mongoose              = require("mongoose");
var passport              = require('passport');
var LocalStrategy         = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User                  = require('./models/user.js');
var bodyParser            = require("body-parser");
var fs                    = require('fs');
var http                  = require('http');
var https                 = require('https');
var methodOverride        = require("method-override");

//vars neededed for ssl
var privateKey  = fs.readFileSync("./open_ssl/server.key", 'utf8');
var certificate = fs.readFileSync("./open_ssl/server.cert", 'utf8');
var credentials = {key: privateKey, cert: certificate};

//main app
var app = express();

//controllers
var authController          = require("./controllers/auth.js");
var homeController          = require("./controllers/home.js");
var networkController       = require("./controllers/network.js");
var profileController       = require("./controllers/profile.js");
var notificationsController = require("./controllers/notifications.js");
var adminController         = require("./controllers/admin.js");
var discussionsController   = require("./controllers/discussions.js");
var settingsController      = require("./controllers/settings.js");

//connect to db
//useNewUrlParser: true to prevent warnings
mongoose.connect("mongodb://localhost/connectedin_db", { useNewUrlParser: true });

//uses
app.use(express.static(__dirname + '/assets/'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// to use put methods when updating or delete
app.use(methodOverride('_method'));

//express session is needed for login/registration password security
app.use(require('express-session')({
    secret            : "pol&kos",
    resave            : false,
    saveUninitialized : false
}));

app.set('view engine', 'ejs');

//passport stuff, used for login and user registration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//using controllers required above
app.use(authController);
app.use(homeController);
app.use(networkController);
app.use(profileController);
app.use(notificationsController);
app.use(adminController);
app.use(discussionsController);
app.use(settingsController);

//vars to run http / https (on different ports)
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080,function(){
   console.log("[INFO] HTTP Server Has Started");
});

httpsServer.listen(8443,function(){
   console.log("[INFO] HTTPS Server Has Started");
});
