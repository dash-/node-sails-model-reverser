
var _ = require('lodash');
var Waterline = require('waterline');


///
// Constructor
///

function Reverser(adapter, tables, options) {
	if(_.isString(tables)) tables = [tables];
	_.isArray(tables) || (tables = []);
	_.isObject(options) || (options = {});

	this.tables = tables;
	this.adapter = adapter;
	this.options = options;
}


///
// Accessors
///

Reverser.prototype.setAdapter = function(adapter) {
	this.adapter = adapter;
};

Reverser.prototype.setTables = function(tables) {
	if(_.isString(tables)) tables = [tables];
	if(! _.isArray(tables)) {
		throw new Error('Tables parameter should be a string or array, not:', tables);
	}

	this.tables = tables;
};

Reverser.prototype.setOptions = function(options) {
	if(! _.isObject(options)) {
		throw new Error('Options parameter should be an object, not:', options);
	}

	this.options = options;
};

Reverser.prototype.reverse = function() {
	var self = this;

	_.forEach(self.tables, function(table) {
		reverseTable(self.adapter, table, self.options);
	});
};

function reverseTable(adapter, table, options) {
	var Model = waterlineModel(table);
	new Model({adapters: {defaultAdapter: adapter}}, function(err, model) {
		if(err) {
			return handleErrors(err);
		}
		model.describe().then(schema => {
			writeSchema(schema, table, options);
		}).catch(handleErrors);
	});
}

function waterlineModel(table) {
	return Waterline.Collection.extend({
		tableName: table,
		adapter: 'defaultAdapter',
		attributes: {}
	});
}


function handleErrors(err) {
	console.error(err.stack);
}

function writeSchema(schema, table, options) {
	console.log(table, schema);
}

module.exports = Reverser;
