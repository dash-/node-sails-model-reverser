"use strict";


///
// Dependencies
///

var Reverser = require('../');
var adapter = require('sails-derby');


///
// Config
///

var connection = {
	url: (
		process.env.APACHE_DERBY_WATERLINE_TEST_URL ||
		'jdbc:derby://localhost:1527/TEST'
	),
	minpoolsize: 10,
	maxpoolsize: 100,
};

var tables = [
	'MYTEST',
	'TESTHOTEL',
];

var options = {
};


///
// Main
///

var reverser = new Reverser(adapter, connection, tables, options);
reverser.reverse();
