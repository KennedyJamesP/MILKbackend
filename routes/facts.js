var express = require('express');
var router = express.Router();
var db = require ("../models");
var Fact = db.fact;
var VERBOSE = false;

const { body, validationResult } = require('express-validator/check');
const { asyncMiddleware } = require('./middleware');

router.get('', asyncMiddleware(async (req, res, next) => {
	const facts = await Fact.findAll();

	res.json(facts);
}));

// ---- POST FACT ----

router.post('', [
		body('section').not().isEmpty().withMessage("Failed to provide a section name"),
		body('desc').not().isEmpty().withMessage("Please provide a desc"),
		body('section_id').not().isEmpty().withMessage("Please provide a section id")
		
	], asyncMiddleware(async (req, res, next) => {

		//check form validation before consuming the request
		const errors = validationResult(req);
	  if (!errors.isEmpty()) {
	  	let errorObj = {};
	  	errors.array().forEach(function(err) {
	  		errorObj[err.param] = err.msg;
	  	})
	    return res.status(422).json({ error: errorObj });
	  }

		const body = req.body;
		const { section, section_id, desc } = body;

		const fact = await Fact.create({
			section: section,
			section_id: section_id,
			desc: desc
		});
		
		res.json(fact);
}));

module.exports = router;