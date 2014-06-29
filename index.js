/*
 * Summary: This file contains the public API functions for foundry-express
 * Author: Ian Reardon <ianjreardon@gmail.com>
 *
 */

// Built-in Node modules
var url = require('url');
var querystring = require('querystring');

// Local modules
var settings = require('./settings.js');

// Public API functions
module.exports = {
	'handle': handle,
	'receive': receive,
	'get': get,
	'post': post,
	'parseBody': parseBody
};

/* This dictionary maps URL pathnames to handler functions and options
 * for processing HTTP requests to those pathnames
 * pathname -> supported methods -> handler, parseOption
 * e.g. {
 *     '/index': {
 *        'GET': {
 *           'handler': getIndex,
 *           'parseOption': 'raw'
 *        },   
 *        'POST': {
 *           'handler': postIndex,
 *           'parseOption': 'json'
 *        }
 *     }
 *  }
 */
var pathMap = {};

/*###################################
  #         PUBLIC FUNCTIONS        #
  ###################################*/

/*
 * handle
 */
function handle(request, response, encodingOrNone) {
	if(typeof encodingOrNone === undefined) {
		encodingOrNone = settings.DEFAULT_ENCODING;
	}
	
	request.setEncoding(encodingOrNone);
	
	request.urlparts = url.parse(request.url, true);
	request.parameters = request.urlparts.query;
	
	var pathname = request.urlparts.pathname;
	var pathMethods = pathMap[pathname];
	
	// no handler registered for path, respond 404 not found
	if(!pathMethods) {
		response.writeHead(404);
		response.end();
		return;
	}
	
	var methodSupported = false;
	// look for the method of this request in this path's supported methods
	for(var method in Object.keys(pathMethods)) {
		if(method === request.method) {
			methodSupported = true;
			break;
		}
	}
	
	// method not supported for this path, respond 400 bad request
	if(!methodSupported) {
		response.writeHead(400, "Method not supported");
		response.end();
		return;
	}
	
	var pathValues = pathMethods[request.method];
	
	// accumulate data in request body
	var body = '';
	request.on('data', function(data) {
		body += data;
	});
	
	// after all data is accumulated, proceed with processing request
	request.on('end', function() {
		request.body = parseBody(body, pathValues.parseOption);
		
		pathValues.handler(request, response);
	});
}

function receive(method, pathname, handler, parseOptionOrNone) {
	if(typeof parseOptionOrNone === undefined) {
		parseOptionOrNone = settings.DEFAULT_PARSE_OPTION;
	}
	
	if(!(callback && typeof(callback) === 'function')) {
		throw 'ERROR: Given handler is not callable.';
	}
	
	// ensure all method mappings are uppercase-only
	method = method.toUpperCase();
	
	var methodValues = {
		'handler': handler,
		'parseOption': parseOptionOrNone
	};
	
	// if there is no mapping for this pathname, create one
	if(!pathMap[pathname]) {
		pathMap[pathname] = {};
	}
	
	pathMap[pathname][method] = methodValues;
}

function get(pathname, handler, parseOptionOrNone) {
	receive('GET', pathname, handler, parseOptionOrNone);
}

function post(pathname, handler, parseOptionOrNone) {
	receive('POST', pathname, handler, parseOptionOrNone);
}

function parseBody(body, parseOption) {
	if(parseOption === 'raw') {
		return body;
	}
	if(parseOption === 'json') {
		return JSON.parse(body);
	}
	if(parseOption === 'querystring') {
		return querystring.parse(body);
	}
	
	throw 'ERROR: "' + parseOption + '" is not a valid body parsing option.';
}