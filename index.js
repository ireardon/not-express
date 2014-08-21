/*
 * Summary: This file contains the public API functions for not-express
 * Author: Ian Reardon <ianjreardon@gmail.com>
 *
 */

// Built-in Node modules
var url = require('url');
var querystring = require('querystring');

// Local modules
var settings = require('./settings.js');
var responseShortcuts = require('./response.js');

// Public API functions
module.exports = {
	'serve': serve,
	'receive': receive,
	'get': get,
	'post': post,
	'use': use,
	'useEarly': useEarly,
	'parseBody': parseBody,
	'setEncoding': setEncoding
};

/*###################################
  #         GLOBAL VARIABLES        #
  ###################################*/

/* This dictionary maps URL pathnames to handler functions and options
 * for processing HTTP requests to those pathnames
 * pathname -> supported methods -> handler, parseOption
 *
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

/* This dictionary contains a listing of middleware functions to
 * be applied during the execution of this.serve. Functions in the early
 * list are run at the beginning of this.serve, functions in the late list
 * are run at the end of this.serve.
 */
var middlewareMap = {
	'early': [],
	'late': []
};

// this encoding is applied to requests and can be set using setEncoding
var requestEncoding = settings.DEFAULT_ENCODING;

/*###################################
  #         PUBLIC FUNCTIONS        #
  ###################################*/

/*
 * >> serve(request, response)
 * This function is intended to be passed as the "requestListener"
 * argument to http.createServer, and takes HTTP requests sent to 
 * the server and routes them to the appropriate handler function.
 * It also performs some error checking and adds some convenient members
 * to the request and response objects along the way.
 */
function serve(request, response) {
	// run each registered "early" middleware function on the request and response
	middlewareMap.early.forEach(function(middlewareFunction) {
		middlewareFunction(request, response);
	});

	request.setEncoding(requestEncoding);
	
	// save all shortcut functions defined in response.js on the response object
	Object.keys(responseShortcuts).forEach(function(key) {
		response[key] = responseShortcuts[key];
	});
	
	// parse the URL for this request and place its elements in a
	// dictionary that is saved as request.urlparts (see Node "url"
	// module documentation for more information)
	request.urlparts = url.parse(request.url, true);
	request.params = request.urlparts.query;
	
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
	Object.keys(pathMethods).some(function(method) {
		if(method === request.method) {
			return methodSupported = true; // acts as a break
		}
	});
	
	// method not supported for this path, respond 405 method not supported
	if(!methodSupported) {
		response.writeHead(405, "Method not supported");
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
		
		// run each registered "late" middleware function on the request and response
		middlewareMap.late.forEach(function(middlewareFunction) {
			middlewareFunction(request, response);
		});
		
		// invoke user-defined handler function
		pathValues.handler(request, response);
	});
}

/*
 * >> receive(method, pathname, handler, [parseOption])
 * Registers a handler function for a request of the provided
 * method type to the provided pathname.
 */
function receive(method, pathname, handler, parseOptionOrNone) {
	if(typeof parseOptionOrNone === 'undefined') {
		parseOptionOrNone = settings.DEFAULT_PARSE_OPTION;
	}
	
	if(!(handler && typeof(handler) === 'function')) {
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

/*
 * >> get(pathname, handler, [parseOption])
 * Registers a handler function for a GET request to the provided pathname.
 */
function get(pathname, handler, parseOptionOrNone) {
	receive('GET', pathname, handler, parseOptionOrNone);
}

/*
 * >> post(pathname, handler, [parseOption])
 * Registers a handler function for a POST request to the provided pathname.
 */
function post(pathname, handler, parseOptionOrNone) {
	receive('POST', pathname, handler, parseOptionOrNone);
}

/*
 * >> use(middlewareFunction)
 * Registers a middleware function to be called with arguments (request, response)
 * after all of the processing in this.serve. This is useful if you want to make
 * use of any of the convenient fields or functions added to the request and response
 * objects by not-express.
 */
function use(middlewareFunction) {
	middlewareMap.late.push(middlewareFunction);
}

/*
 * >> useEarly(middlewareFunction)
 * Registers a middleware function to be called with arguments (request, response)
 * before any of the processing in this.serve. This is useful for accessing the
 * untouched request and response objects before not-express gets to them.
 */
function useEarly(middlewareFunction) {
	middlewareMap.early.push(middlewareFunction);
}

/*
 * >> parseBody(body, parseOption)
 * Parses the given body string according to
 * the given option. It supports "json" and "querystring"
 * and will return the body unaltered with "raw".
 */
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

/*
 * >> setEncoding(encodingIdentifier)
 * Sets the encoding to be used to interpret request contents.
 */
function setEncoding(encodingIdentifier) {
	requestEncoding = encodingIdentifier;
}