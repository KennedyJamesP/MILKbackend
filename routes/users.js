var express = require('express');
var router = express.Router();
var User = require("../models").User;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**	
	This HTTP POST function creates a new user entry in the users table with the 
* name and email arguments provided in the request.
*
* endpoint: /api/users/new_user
* http method type: POST
* Arguments: new user's username, password and email must be sent in the body of the request as JSON:
* request.body: {username: "Jimmy123", email: "jimmy's email", password:"jimmys pwd"}

* Returns: if successful, a response is sent with status code 200 containing the 
	JSON encoded object with the created user's username, email and assigned unique id,
	 accessible as the "data" member of the response body:
*	response.body:	{data: {username: "Jimmy123", id: 123, email:...},  ...}	
**/
router.post('/add-new-user', function(req, res, next) {
	const new_entry = req.body;
	console.log("/users/add-new-user request body: ", new_entry);
	const entry_uname = new_entry.username;
	const entry_email = new_entry.email;
	const entry_pwd = new_entry.password;

	/* insert new entry into users table */
	return query = User.create({
			username: entry_uname,
			email: entry_email, 
			password: entry_pwd
		},
		{
		    attributes: {
		        exclude: ['password']
		    }
		})
	  	.then( new_entry => { 
			console.log("USERS.JS: New User inserted:", new_entry);
				req.session.user_id = new_entry.id;
				req.session.user_name = new_entry.username;
			return new_entry;
		})
		.then( query_data => {
		  	res.json({message: 'ok', data:query_data});
	  	})
		.catch( err => {
	    	console.log("USERS.JS->/new): Error creating new user:", err.message );

	    	if (err instanceof Sequelize.ValidationError && err.errors) {
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

				return res.status(400).json({message: err_msgs.join(", ")});
	    	}
	    	return res.status(500).json({message: err.message});
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
router.post("/login", (req, res, next) => {
	const new_entry = req.body;
	console.log("serving /users/login request: ", new_entry);
	const entry_email = req.body.email;
	const entry_pwd = req.body.password;
	/* query for entry in users table */
	return User.findOne({
			where: {
				email: entry_email, 
				password: entry_pwd,
			}
		})
		.then(user => {

			if (user === null) {
				return res.status(401).json({
					message: "Log in failed: Email or password was not correct."
				});
			}
			else {
				console.log("User logged in:", user );
				//set session to store userID
				req.session.user_id = user.id;
				req.session.user_name = user.username;
				console.log("session saved: " + JSON.stringify(req.session));
				return res.json({message: "login successful", data: user});
			}
		})
		.catch(err => {
			console.log("Error logging user in: ", err);
			res.status(500).json({message: "Log in failed", error: err.message });
		});
})



router.post("/logout", (req, res, next) => {
	console.log("serving /users/logout request: ");
	/* Destroy the current session */
	if (req.session) {
		req.session.destroy();
	}
	return res.json({loggedout: true});
})


module.exports = router;
