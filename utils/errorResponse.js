'use strict';

// //not working //check

module.exports =  {
	validateResonse: function(req) {
		const errors = validationResult(req);

	  if (!errors.isEmpty()) {

	    let errorObj = {};
	  	errors.array().forEach(function(err) {
	  		errorObj[err.param] = err.msg;
	  	})
	    return errorObj;
	  }

	  return null;
	}
};