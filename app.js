require('dotenv').config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const db = require("./config/db");
const session = require("express-session");
const ejs = require("ejs");
const expressLayouts = require('express-ejs-layouts')





var usersRouter = require("./routes/userRoute");
var adminRouter = require("./routes/adminRoute");
const productRouter = require("./routes/productRoute");

var app = express();

// view engine setup
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', './views');


app.use(expressLayouts); // Use express-ejs-layouts middleware
app.set('layout', 'layouts/adminLayout');

app.locals.partialsDir = './views/partials';
 

app.use( 
  session({ 
    secret: "secret",
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 
    },
    resave: false
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));





// app.use((req, res, next) => {
//   res.header(
//     "  Cache-Control",
//     "no-cache, private, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0"
//   );
//   next();
// });




app.use("/", usersRouter);
app.use("/admin", adminRouter);
app.use("/product",productRouter);

console.clear();
  db.connect((err) => {
    if (err) {
      console.log(err);
    }
  });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
