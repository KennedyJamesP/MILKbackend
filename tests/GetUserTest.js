var fetch = require("node-fetch");
var db = require("../models");
var get_user_by_uid = require("../Client.js").get_user_by_uid;


function get_user_test() {
	const TEST_UID = 1;

	console.log("STARTING GET USER TEST-----");

	return get_user_by_uid(TEST_UID)
	.then((data) => { 

		console.log("User info retrieved: ", data);
		console.log("Get User By Uid Test success!");
	})
	.catch((error) => {  
		console.log('Error getting user by id: ', error);  
		console.log("Get User By Uid Test failed with errors.");
	})
	.then( () => db.close());
	
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