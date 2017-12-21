var fetch = require("../Client.js").fetch;
var add_new_user = require("../Client.js").add_new_user;
var	db = require("../models");
function handleAddNewUser () {
	console.log("(ADDNEWUSERTEST) beginning test.");
	const username ="milky milk";
	const email = "milky@milk.com";
	const pwd = "milk123";

	return add_new_user(username, email, pwd)
		.then ( user_data => console.log("(ADDNEWUSERTEST) new user entry:", user_data))
		.catch ( err => {
			console.log("(ADDNEWUSERTEST) error:", err);
			err => console.log("(ADDNEWUSERTEST) failed with errors.");
		});
   }

  handleAddNewUser();