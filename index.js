"use strict";


///
// Dependencies
///

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var _ = require('lodash');
var Waterline = require('waterline');

var log = (process.env.LOG_REVERSER === 'true') ? console.log : function () {};


///
// Setup
///

var template = _.template(fs.readFileSync(path.join(
	__dirname, 'model.template.ejs'
)));

var defaultOptions = {
	outputPath: path.join(__dirname, 'generated')
};


///
// Constructor
///

function Reverser(adapter, connection, tables, options) {
	_.isNil(adapter) || this.setAdapter(adapter);
	_.isNil(connection) || this.setConnection(connection);
	_.isNil(tables) || this.setTables(tables);
	_.isNil(options) || this.setOptions(options);
}


///
// Accessors
///

Reverser.prototype.setAdapter = function(adapter) {
	this.adapter = adapter;
};

Reverser.prototype.setConnection = function(connection) {
	if(! _.isObject(connection)) {
		throw new Error(
			'Connection parameter should be an object, not:', connection
		);
	}

	this.connection = connection;
};

Reverser.prototype.setTables = function(tables) {
	if(_.isString(tables)) tables = [tables];
	if(! _.isArray(tables)) {
		throw new Error(
			'Tables parameter should be a string or array, not:', tables
		);
	}

	this.tables = tables;
};

Reverser.prototype.setOptions = function(options) {
	if(! _.isObject(options)) {
		throw new Error('Options parameter should be an object, not:', options);
	}

	this.options = _.defaults(options, defaultOptions);
};


///
// Primary public methods
///

Reverser.prototype.reverse = function() {
	log('reverse()', this.connection, this.tables, this.options);

	var self = this;
	var wlConfig = waterlineConfig(self.adapter, self.connection);
	var orm = new Waterline();

	_.forEach(self.tables, function(table) {
		orm.loadCollection(waterlineModel(table));
	});

	function reverseNext(models, idx) {
		if(_.isUndefined(idx)) idx = 0;
		if(_.isUndefined(models[idx])) return Promise.resolve();

		var model = models[idx];

		return model.model.describeAsync().then(schema => {
			writeSchema(schema, model.identity, model.table, self.options);
			return reverseNext(models, idx + 1);
		});
	}

	return new Promise((resolve, reject) => {
		try {
			orm.initialize(wlConfig, (err, models) => {
				if(err) {
					return reject(err);
				}

				var allModels = [];

				_.forEach(models.collections, (model, identity) => {
					Promise.promisifyAll(model);

					allModels.push({
						table: model.adapter.collection,
						identity: identity,
						model: model
					});
				});

				reverseNext(allModels).then(() => {
					resolve();
				}).catch(err => {
					reject(err);
				});
			});

		} catch(err) {
			reject(err);
		}
	});
};


///
// Private static methods / helpers
///

function waterlineModel(table) {
	var Model = Waterline.Collection.extend({
		identity: table,
		tableName: table,
		connection: 'default',
		attributes: {}
	});

	return Model;
}

function waterlineConfig(adapter, connection) {
	return {
		adapters: {
			'default': adapter,
		},

		connections: {
			'default': _.extend({}, connection, {
				adapter: 'default',
			}),
		},

		defaults: {
			migrate: 'safe'
		}
	};
}

function handleErrors(err) {
	console.error(err.stack);
}

function writeSchema(schema, identity, table, options) {
	if(_.isUndefined(schema)) {
		return;
	}

	identity = identity.charAt(0).toUpperCase() + identity.slice(1);

	var code = template({
		schema: schema,
		identity: identity,
		table: table,
		options: options,
		attrFormat: attrFormat,
		_: _
	});

	var file = path.join(options.outputPath, identity + '.js');
	return fs.writeFileAsync(file, code);
}

function attrFormat(attr) {
	if(_.isNull(attr)) {
		return 'null';
	}
	if(_.isString(attr)) {
		return "'" + attr + "'";
	}
	if(_.isObject(attr)) {
		return JSON.stringify(attr);
	}
	return attr.toString();
}


///
// Exports
///

module.exports = Reverser;

