not-express
===============
This library is a lightweight alternative to Express built using only core Node modules.
It provides convenience functions similar to those used in Express to make handling and
responding to incoming HTTP requests a breeze. It is however, not nearly as full-featured
as Express and will not support Express middlewares. It is not in any way suitable for
production software.

This library was built as a learning experience. I've used Express quite a bit and wanted
to see how much work had to be done on top of Node to provide the ease of Express.

You can check out the library's functionality by running the included example (you'll need 
Node.js installed on your machine):
1. CD into the "example" directory in a shell
2. Run "node example.js"
3. Open your web browser and navigate to "localhost:8080"
4. Then try "localhost:8080/send_json" or "localhost:8080/redirect"
5. Open up example.js to see how the API works