# Requires
express = require("express")
coffee = require("coffee-script")
nowpad = require(__dirname + "/../../lib/nowpad.coffee")
myNowpad = false

# =====================================
# Server

# Create Server
app = express.createServer()
app.configure ->
	# Params
	app.set "views", __dirname + "/views"
	app.set "view engine", "ejs"

	# Middlewares
	app.use app.router
	app.use express.static(__dirname)

	# Nowpad
	myNowpad = nowpad.createInstance(server: app)

# Start Server
app.listen 9572
console.log "Express server listening on port %d", app.address().port

# Route Server
app.all "/", (req, res) ->
	res.render "doc", locals: title: "NowPad!"

# =====================================
# Nowpad

# Create known documents
myNowpad.addDocument "doc1", "this is doc1"
myNowpad.addDocument "doc2", "this is doc2"

# Handle unknown document
# Fires when an unknown document is requested
myNowpad.requestDocument (documentId, callback) ->
	# nowpad.addDocument documentId
	# callback true
	callback false

# Handle sync request
# Fires when a change is synced to the document
myNowpad.bind "sync", (document, value) ->

# Handle disconnect request
# Fires when all the clients have disconnected from a document
myNowpad.bind "disconnected", (document, value) ->