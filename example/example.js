var http = require('http');
var fs = require('fs');
var fexpress = require('../index.js');

http.createServer(fexpress.serve).listen(8080);
console.log('-- Webserver listening on port 8080');

// set up a view to handle get requests to /
fexpress.get('/', function(request, response) {
	response.html('Welcome to the example foundry-express server!');
});

// set up a view to handle post requests to /receive_json
fexpress.post('/receive_json', function(request, response) {
	console.log('\nReceived JSON data from the webpage! Here it is:');
	console.log(request.body);
	console.log('\nTo demonstrate that you can access the body content as a dictionary:');
	console.log(request.body.microsoft.redmond);
	
	response.text('Got it!');
}, 'json');

/* set up view to return an HTML page when someone navigates to /send_json
 * when your browser renders it, the HTML page sends a POST request to /receive_json
 * containing a JSON body
 */
fexpress.get('/send_json', function(request, response) {
	var htmlFilename = './send_data.html';
	fs.readFile(htmlFilename, function(error, fileContents) {
		if (error) {
			console.log('Oh noes! The file "' + htmlFilename + '" does not exist or is inaccessible!' );
		}
		else {
			response.html(fileContents);
		}
	});
});

// install a middleware function that is invoked whenever an HTTP request is received
fexpress.use(function(request, response) {
	console.log(request.method + ' ' + request.urlparts.pathname);
});