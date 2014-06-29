/*
 * Summary: This file contains convenience functions for
 * dispatching responses to HTTP requests. These functions
 * are saved in the response object passed to user-defined handler functions.
 */

module.exports = {
	'json': json,
	'render': render,
	'text': text
};

/*
 * >> response.json(content)
 * Dispatches the HTTP response with the given JSON content.
 */
function json(content) {
	this.writeHead(200, { 'Content-Type': 'application/json' });
	this.end(content);
}

/*
 * >> response.render(content)
 * Dispatches the HTTP response with the given HTML content.
 */
function render(content) {
	this.writeHead(200, { 'Content-Type': 'text/html' });
	this.end(content);
}

/*
 * >> response.text(content)
 * Dispatches the HTTP response with the given plaintext content.
 */
function text(content) {
	this.writeHead(200, { 'Content-Type': 'text/plain' });
	this.end(content);
}