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

router.get('', function(req, res, next) {
	return Fact.findAll()
	.then(result => {
		res.json({result});
	})
	.catch(err => {
		console.log('failed fetching facts');
		res.status(500).json({error: err.message})
	});
});

router.post('', function(req,res,next) {
	const body = req.body;

	const section = body.section;
	const desc = body.desc;

	if (!section || !desc) {
		return res.status(400).json({error: "failed to send section and desc"});
	}

	return Fact.create({
		section: section,
		desc: desc
	})
	.then(result => {
		res.json({result});
	})
	.catch(err => {
		res.status(500).json({error: err.message});
	});
});

module.exports = router;