/*
* Author: James Kennedy jpkennedyiv@gmail.com
*/

//For form validation should use
//https://www.npmjs.com/package/express-validator

var express = require('express');
var router = express.Router();
var db = require ("../models");
var User = db.user;
var VERBOSE = false;

/**	
	This HTTP POST function creates a new user entry in the users table with the 
* name and email arguments provided in the request.
*
* endpoint: /api/users/signup
* http method type: POST
* Arguments: new user's username, password and email must be sent in the body of the request as JSON:
* request.body: {username: "Jimmy123", email: "jimmy's email", password:"jimmys pwd"}

* Returns: if successful, a response is sent with status code 200 containing the 
	JSON encoded object with the created user's username, email and assigned unique id,
	 accessible as the "data" member of the response body:
*	response.body:	{data: {username: "Jimmy123", id: 123, email:...},  ...}	
**/
router.post('/signup', function(req, res, next) {
	const body = req.body;

	const email = body.email;
	const username = body.username;
	const password = body.password;

	/* insert new entry into users table */
	User.create({
		username: username,
		email: email, 
		password: password
	},
	{
    attributes: {
      exclude: ['password']
    }
	})
  .then(user => { 
		console.log("USERS.JS: New User inserted:", user);
			//TODO: decide wether to keep req.session
			//req.session.user_id = new_entry.id;
			//req.session.user_name = new_entry.username;
		res.json({user});
	})
	.catch( err => {
  	console.log("USERS.JS->/new): Error creating new user:", err.message );

  	if (err instanceof db.Sequelize.ValidationError && err.errors) {
  		var err_msgs = [];
  		var message = "";
  		var each_err = "";
  		for (var err_idx = 0; err_idx < err.errors.length; err_idx++) {
  			each_err = err.errors[err_idx];
  			if (VERBOSE) console.log ("error: ", each_err);
    		message = "";
  			if (each_err.type === "unique violation") {
  				message = "A user account already exists for the provided "	+ each_err.path
  					 + ": " + each_err.value;
  			}
  			else {
  				message = each_err.message;
  			}

  			err_msgs.push(message);
  		}

  		if (VERBOSE) console.log ("err_msgs: ", err_msgs);

			return res.status(400).json({error: err_msgs.join(", ")});
  	}

  	return res.status(500).json({error: err.message});
  });
});

/**	
	This HTTP POST function logs a user in with the 
* email and password arguments provided in the request.
*
* Arguments: existing user's password and email must be sent in
* 	the body of the request as JSON:
*		{email: "new user's email", password:"secret"}

* Returns: if successful, a response is sent with status code 200 containing the 
	JSON encoded object with the created user's name and assigned unique id,
	 accessible as the "data" member of the response body:
*		{data: {id: 123, username: "NEW USERS NAME", ...} }	
**/

router.post('/signin', function(req, res, next) {
	const body = req.body;

	const email = body.email;
	const password = body.password;

	User.findOne({
		where: {
			email: email,
			password: password,
		}
	})
	.then(user => {
		if (user === null) {
			return res.status(401).json({
				error: "Log in failed: Email or password was not correct."
			});
		}

		//TODO: set session to store userID
		//req.session.user_id = user.id;
		//req.session.user_name = user.username;
		//console.log("session saved: " + JSON.stringify(req.session));

		res.json({user});
	})
	.catch(err => {
		console.log("Error logging user in: ", err);
		res.status(500).json({error: err.message});
	});
});

//Created By: Noah Davidson 
router.get("/:id", (req, res, next) =>{
	var id = req.params.id;

	if (!id) {
		return res.status(400).json({error: "incorrect id provided"});
	}

	//This is broken....
	//User.get_user_by_id(id);

	User.findById(id)
  .then(user => {

  	if (user === null) {
			return res.status(401).json({
				error: "Log in failed: Email or password was not correct."
			});
		}

    console.log("User successfully retrieved from db: "+ JSON.stringify(user));
    res.json({user})
  })
  .catch(err => {
    console.log("Error retrieving user from db:" + JSON.stringify(err));
    res.status(500).json({error: err})
  })
});

router.post("/signout", (req, res, next) => {
	console.log("serving /users/signout request");
	/* TODO: Destroy the current session */
	//if (req.session) {
	//	req.session.destroy();
	//}
	return res.json({loggedout: true});
})

module.exports = router;