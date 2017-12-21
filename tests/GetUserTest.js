var fetch = require("node-fetch");
var db = require("../models");
var get_user_by_username = require("../Client.js").get_user_by_username;


function get_user_test() {
	const TEST_USERNAME = "milky milk";

	console.log("STARTING GET USER TEST-----");

	return get_user_by_username(TEST_USERNAME)
	.then((data) => { 
		console.log("User info retrieved: ", data);
		console.log("Get User By Username Test success!");
	})
	.catch((error) => {  
		console.log('Error getting user by id: ', error);  
		console.log("Get User By Uid Test failed with errors.");
	})
	
}



/** this middleware function is a adapted from: 
https://github.com/fullstackreact/food-lookup-demo/blob/master/server.js
*/ 
function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}
	const error = new Error(`HTTP Error ${response.statusText}`);
	error.status = response.statusText;
	error.response = response;
	console.log(error); // eslint-disable-line no-console
	throw error;
}

function parseJSON(response) {
	return response.json();
}


get_user_test();