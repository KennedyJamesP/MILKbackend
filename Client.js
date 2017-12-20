/* React Client module for communicating with express server. 
*/

/* THIS MUST BE SET FALSE TO OPERATE THIS FILE THROUGH REACT IN A BROWSER,
* AND MUST BE SET TRUE TO OPERATE THIS FILE FROM THE COMMAND LINE USING NODE
*/
const COMMAND_LINE_TESTING = true;

/* duct tape for testing from command line node environment  */
var prepend_path = "";
if (COMMAND_LINE_TESTING) {
	const fetch = require("node-fetch");
	prepend_path = "https://milk-backend.herokuapp.com";
}


/** This function creates a new user account with the name, email, and password
* arguments provided and returns the created user's information if successful.
*
* Arguments:
* name: new user's name
* email: new user's email
* pwd: new user's password
*
* Returns:  an object with the entry that was created in the database, like this:
*		{name: "NAME", id: 123, ...}	
*/
function add_new_user(name, email, pwd) {

	return fetch(prepend_path + "/users/add-new-user", {
		method: "POST",
		credentials: "same-origin",//this line enables cookies 
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: name,
			email: email,
			password: pwd,
		})
	})
	.then(checkStatus)
	.then(parseJSON)
	.then(result => {
		console.log("(CLIENT.JS->ADD_NEW_USER) Response OK with new user data obj: ", result.data);
		console.log("(CLIENT.JS->ADD_NEW_USER) responded with status OK"); 
		return result.data;
	})
	.catch(error => {  
		console.log("(CLIENT.JS->ADD_NEW_USER) Request Error:", error.message);
		console.log("(CLIENT.JS->ADD_NEW_USER) Request Failed with Errors.");
		throw error;

	});
}


function login(email, pwd) {

	return fetch(prepend_path + "/users/login", {
		method: "POST",
        credentials: "same-origin", // enables session cookie
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email: email,
			password: pwd,
		})
	})
	.then(checkStatus)
	.then(parseJSON)
	.then(result => {
		console.log("(CLIENT.JS->LOGIN) Response OK with new user data obj: ", result.data);
		console.log("(CLIENT.JS->LOGIN) responded with status OK"); 
		return result.data;
	})
	.catch(error => {  
		console.log("(CLIENT.JS->LOGIN) Request Error:", error);
		console.log("(CLIENT.JS->LOGIN) Request Failed with Errors.");
		throw error;

	});
}

function logout(){
  return fetch(prepend_path + "/users/logout", {
	method: "POST", 
	credentials: "same-origin", //session cookies enabled
	headers: {
		"Accept": "application/json",
		"Content-Type": "application/json"
	}
  })
  .then(checkStatus)
  .then(parseJSON)
  .then(res => {
	return res;
  })
  .catch(error => {
	console.log("(CLIENT.JS->LOGOUT) Request Error:", error);
	console.log("(CLIENT.JS->LOGOUT) Request Failed with Errors.");
	throw error;
  });	

}


/* this function gets someone else's profile information by uid 
* ...including their email and password
* BAD BAD BAD but good for testing 
*/
function get_user_by_uid (uid) {

	return fetch("/users/get-user-by-id/" + uid, {
			method: "GET",
			headers: {accept: "application/json"},
        	credentials: "same-origin",
		})
		.then(checkStatus)
		.then(parseJSON)
		.then(result => {
			console.log("(CLIENT.JS->GET_USER_BY_UID) Response OK with new user data obj: ", result.data);
			console.log("(CLIENT.JS->GET_USER_BY_UID) responded with status OK"); 
			return result.data;
		} )
		.catch(function(error) {  
			console.log("(CLIENT.JS->GET_USER_BY_UID) Request Error:", error);
			console.log("(CLIENT.JS->GET_USER_BY_UID) Request Failed with Errors.");
			throw error.body;  
		});
}




/** this middleware function is a adapted from: 
https://github.com/fullstackreact/food-lookup-demo/blob/master/server.js
*/
function checkStatus(response)  {
	if (response.status >= 200 && response.status < 300) {
		return response;
	} else {
		const error = new Error(`HTTP Error ${response.statusText}`);
		error.status = response.statusText;
		return parseJSON(response)
			.then((res) => {
				error.message = res.message;
				console.log("CheckStatus Error Code ", response.status,": ", error.status); //
				console.log(res); //
				throw error;
			})
			.catch(function(error) {
				console.log(error); // eslint-disable-line no-console
				throw error;
			});
	}
	
}


function parseJSON(response) {
	return response.json();
}


module.exports = {  
	add_new_user, get_user_by_uid, login, logout, 
};

