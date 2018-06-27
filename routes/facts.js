/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();
var db = require ("../models");
var User = db.users;
var VERBOSE = false;

route.get('/facts', function(req, res, next) {
	return Fact.findAll()
	.then(result => {
		return result;
	})
	.catch(err => {
		console.log('failed fetching facts');
		return res.status(500).json({error: err.message})
	});
});

route.post('/facts', function(req,res,next) {
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
		return result;
	})
	.catch(err => {
		return res.status(500).json({error: err.message});
	});
});