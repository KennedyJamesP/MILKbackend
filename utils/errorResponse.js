'use strict';

//not working

module.exports =  {
	toJSON: function(errors) {
		let errorObj = {};
  	errors.array().forEach(function(err) {
  		errorObj[err.param] = err.msg;
  	});
  	return errors
	}
};