/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();
var db = require ("../models");
var Fact = db.fact;
var VERBOSE = false;

/*
*	WHY THE F ARE CLASS & INSTANCE METHODS NOT WORKING :(
*/

const { body, validationResult } = require('express-validator/check');

router.get('', function(req,res) {
	return Fact.findAll()
	.then(result => {
		res.json(result);
	})
	.catch(err => {
		console.log('failed fetching facts');
		res.status(500).json({error: err.message})
	});
});

// ---- POST FACT ----

router.post('', [
		body('section').not().isEmpty().withMessage("Failed to provide a section name"),
		body('desc').not().isEmpty().withMessage("Please provide a desc"),
	], function(req,res) {

		//check form validation before consuming the request
		const errors = validationResult(req);
	  if (!errors.isEmpty()) {
	  	let errorObj = {};
	  	errors.array().forEach(function(err) {
	  		errorObj[err.param] = err.msg;
	  	})
	    return res.status(422).json({error:errorObj});
	  }

		const body = req.body;

		const section = body.section;
		const desc = body.desc;

		return Fact.create({
			section: section,
			desc: desc
		})
		.then(fact => {
			res.json(fact);
		})
		.catch(err => {
			res.status(500).json({error: err.message});
		});
});

module.exports = router;