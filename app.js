//add babel to project

/*____ ATTENTION ____
*
* This file only supports ES5 syntax
* DO NOT use ES6 in this file
*
*/ 
require("babel-core/register");

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./models');

var users = require('./routes/users');
var statues = require('./routes/statues');
var posts = require('./routes/posts');
var facts = require('./routes/facts');

var app = express();

// We do not need this :)
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);

app.use('/statues', statues);

app.use('/posts', posts);

app.use('/facts', facts);

app.get('/test', function(req, res,next){
	db.sequelize.authenticate()
    .then(() => {
      res.status(200).json({
        message: "server and db connection have been established successfully.",
        "details": "JPK IS EXCEPTIONALLY G AND POWERFUL MASTER-CS-WIZARD"
      });
    })
    .catch(err => {
      res.status(420).json({
        message: "Unable to connect to the database:",
        error: err
      });
    });
});


/* GET users listing. */
app.get('/', function(req, res, next) {
  res.json({
    "message": "JPK IS EXCEPTIONALLY G AND POWERFUL MASTER-CS-WIZARD(SERVER REACHED SUCCESSFULLY)"
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // the error page
  res.status(err.status || 500);
  res.json({
    'messsage': 'Error: ' + err.messsage, 
    'error': err
  });
});

module.exports = app;
