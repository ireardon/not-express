/*
 * Summary: This file contains convenience functions for
 * dispatching responses to HTTP requests. These functions
 * are saved in the response object passed to user-defined handler functions.
 */

module.exports = {
	'json': json,
	'html': html,
	'text': text,
	'xml': xml,
	'redirect': redirect,
	'notFound': notFound,
	'badRequest': badRequest,
	'forbidden': forbidden
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
 * >> response.html(content)
 * Dispatches the HTTP response with the given HTML content.
 */
function html(content) {
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

/*
 * >> response.xml(content)
 * Dispatches the HTTP response with the given XML content.
 */
function xml(content) {
	this.writeHead(200, { 'Content-Type': 'application/xml' });
	this.end(content);
}

/*
 * >> response.redirect(targetUrl)
 * Dispatches a redirect response asking the user's browser to
 * resend the request to the provided URL.
 */
function redirect(targetUrl) {
	this.writeHead(307, { 'Location': targetUrl });
	this.end();
}

/*
 * >> response.notFound()
 * Dispatches the HTTP response with error code 404 not found.
 */
function notFound() {
	this.writeHead(404);
	this.end();
}

/*
 * >> response.badRequest()
 * Dispatches the HTTP response with error code 400 bad request.
 */
function badRequest() {
	this.writeHead(400);
	this.end();
}

/*
 * >> response.forbidden()
 * Dispatches the HTTP response with error code 403 forbidden.
 */
function forbidden() {
	this.writeHead(403);
	this.end();
}