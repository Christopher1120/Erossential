var express = require('express');
var path = require("path");
var flash = require("connect-flash");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var moment = require("moment");
var cors = require("cors");
var session = require("express-session");
var cookieParser = require("cookie-parser")
var passport = require("passport");
var params = require("./params/params");
var setUppassport = require("./setuppassport");



var app = express();

var port = app.set("port", process.env.PORT || 80);


app.use(cors({
    origin: '*'
}));

setUppassport();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: "Napakapogiko20",
    resave: true,
    saveUninitialized: true,
    cookie: {
        auth: true,
    }
}));

mongoose.set('strictQuery', true);
mongoose.connect(params.DATABASECONNECTION, { useUnifiedTopology: true, useNewUrlParser: true });


app.use(flash());
app.use((req, res, next) => {
    res.locals.moment = moment;
    next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use("/", require("./routes/web"));
app.set("views", path.join(__dirname, "views"));
app.use("/scripts", express.static(path.resolve(__dirname, "scripts")));
app.use("/css", express.static(path.resolve(__dirname, "css")));
app.use("/images", express.static(path.resolve(__dirname, "images")));
app.use("/invoices", express.static(path.resolve(__dirname, "invoices")));

app.listen(app.get("port"), function (req, res) {
    console.log("Application is now running at port " + app.get("port"));
});