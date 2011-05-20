# Require
fs = require 'fs'
now = require 'now'
path = require 'path'
coffee = require 'coffee-script'
nowpadCommon = require(__dirname+'/public/common.coffee').nowpadCommon
List = nowpadCommon.List

# -------------------------------------
# Classes

class Client
	# Required
	id: null
	nowpad: null

	# Optional
	documentIds: []

	# Constructor
	constructor: (id,nowpad) ->
		# Reset
		@documentIds = []

		# Apply
		@id = id
		@nowpad = nowpad
	
	# Destroy
	destroy: ->
		# Prepare
		clientId = @id

		# Remove
		@nowpad.clients.remove clientId

		# Clear Documents
		documentIds = @documentIds
		@documentIds = []

		# Destroy Documents
		for documentId in documentIds
			document = @nowpad.documents.get documentId
			if document and typeof document.clientIds[clientId] is not 'undefined'
				delete document.clientIds[clientId]
				if document.clientIds.length is 0
					document.destroy()
	
		# Log
		console.log 'Destroyed Client', clientId

class Document
	# Required
	id: null
	nowpad: null

	# Optional
	value: ''
	state: false
	delay: 200
	states: []
	offset: 0
	locked: false
	clientIds: []

	# Constructor
	constructor: (id,value,nowpad) ->
		# Reset
		@states = []
		@clientIds = []

		# Apply
		@id = id
		@value = value if value
		@nowpad = nowpad

	# Lock
	lock: (clientId) ->
		success = false

		if !@locked
			@locked = clientId
			success = true
			console.log 'Client '+clientId+' locked the document '+@id
		else
			console.log 'Client '+clientId+' failed to lock the document '+@id
			console.log 'it\'s currently locked by client '+@locked
		
		return success
	
	# Unlock
	unlock: (clientId) ->
		success = false

		if @locked is clientId
			@locked = false
			success = true
			console.log 'Client '+clientId+' unlocked the document '+@id
		else
			console.log 'Client '+clientId+' failed to unlock the document '+@id
			console.log 'it\'s currently locked by client '+@locked
		
		return success
	
	# Destroy
	destroy: ->
		# Prepare
		documentId = @id

		# Remvoe
		@nowpad.clients.remove documentId

		# Clear Clients
		clientIds = @clientIds
		@clientIds = []

		# Destroy Clients
		for clientId in clientIds
			client = @nowpad.clients.get clientId
			if client and typeof document.documentIds[documentId] is not 'undefined'
				delete document.documentIds[documentId]
				if client.documentIds.length is 0
					client.destroy()
		
		# Log
		console.log 'Destroyed Document', documentId

class DocumentList extends List
	# Init
	constructor: (nowpad) ->
		@nowpad = nowpad
	
	# Get a document, or create it if it doesn't exist
	# next(err,document)
	fetch: (id,next) ->
		document = @get id
		if document
			next false, document
		else if @nowpad.requestHandler
			@nowpad.requestHandler id, =>
				document = @get id
				if document
					next false, document
				else
					next Error 'Could not fetch the document '+id
		else
			document = new Document id, false, @nowpad
			@nowpad.documents.add document
			next false, document

# -------------------------------------
# Server

class Nowpad

	# Server
	server: null
	everyone: null
	port: null
	filePath: __dirname
	fileNames: [
		'public/diff_match_patch.js'
		'public/common.coffee'
		'public/client.coffee'
	]
	fileString: ''

	# Nowpad
	documents: null
	clients: null
	requestHandler: null
	
	# Events
	events:
		sync: []
		disconnected: []
	
	# Initialise
	constructor: ({server,everyone}={}) ->
		# Prepare
		@server = server
		@everyone = everyone || now.initialize @server, {clientWrite: false}

		# Clean
		@documents = new DocumentList(@)
		@clients = new List()

		# Now
		@nowBind()

		# Cache
		@cacheClientScript()

		# Routes
		@server.get '/nowpad/nowpad.js', (req,res) =>
			@serveClientScript(req,res)

		# Clean
		@documents = new DocumentList(@)
		@clients = new List()

	# Cache the client script
	cacheClientScript: ->
		@fileString = ''
		@fileNames.forEach (value) =>
			fileFullPath = @filePath+'/'+value
			fs.readFile fileFullPath, (err,data) =>
				throw err if err
				if path.extname(fileFullPath) is '.coffee'
					@fileString += coffee.compile(data.toString())
				else
					@fileString += data.toString()
	
	# Server the client script
	serveClientScript: (req,res) ->
		res.writeHead 200, 'content-type': 'text/javascript'
		res.write @fileString
		res.end()
	
	# Log
	log: ->
		console.log(
			clients: @clients
			documents: @documents
		)
	
	# Add document
	addDocument: (documentId,value) ->
		unless @documents.has documentId
			document = new Document documentId, value, @
			@documents.add document

	# Delete document
	delDocument: (documentId) ->
		document = @documents.get documentId
		if document
			document.destroy()

	# Request document
	requestDocument: (requestHandler) ->
		if @requestHandler
			throw new Error 'Request handler already defined'
		@requestHandler = requestHandler
	
	# Initialise Now.js
	nowBind: ->
		nowpad = @
		everyone = @everyone

		# A client has connected
		everyone.connected ->
			# Create the new client
			clientId = nowpad.clients.generateId()
			client = new Client(clientId,nowpad)
			nowpad.clients.add(client)

			# Associate it with now
			@now.clientId = clientId

			# Log
			console.log 'New Client:', clientId

		# A client has disconnected
		everyone.disconnected ->
			# Fetch
			clientId = @now.clientId
			nowpad.clients.destroy @now.clientId

			# Log
			console.log 'Bye Client:', clientId
		
		# A client is shaking hands with the server
		everyone.now.nowpad_handshake = (notifySync,notifyDelay,callback) ->
			# Check the user isn't evil
			if (typeof notifySync isnt 'function') or (typeof notifyDelay isnt 'function')
				console.log 'Evil client'
				return false
			
			# Apply the client-side functions used to notify the client to the now session
			@now.nowpad_notifySync = notifySync
			@now.nowpad_notifyDelay = notifyDelay

			# Trigger the callback
			if callback then callback(@now.clientId)
	
		# Create a timer to ensure locks don't last forever
		lockTimer = false
		lockTimerDelay = 1500

		# Lock a document
		everyone.now.nowpad_lockDocument = (documentId, callback) ->
			# Fetch Document
			nowpad.documents.fetch documentId, (err,document) =>
				# Error
				if err
					console.log err
					return

				# Attempt document lock
				result = document.lock @now.clientId

				# If success, set a timeout
				if result
					lockTimerCallback = =>
						clearTimeout lockTimer
						lockTimer = false
						console.log '\n!!! A lock has lasted too long... !!!\n'
						document.unlock @now.clientId
					lockTimer = setTimeout lockTimerCallback, lockTimerDelay
				
				# Send result back to client
				if callback then callback result
			
		# Unlock
		everyone.now.nowpad_unlockDocument = (documentId, callback) ->
			# Fetch Document
			nowpad.documents.fetch documentId, (err,document) =>
				# Error
				if err
					console.log err
					return

				# Attempt document unlock
				result = document.unlock @now.clientId

				# Clear timeout
				clearTimeout lockTimer
				lockTimer = false

				# Send result back to client
				if callback then callback result
			
		# Log
		everyone.now.nowpad_log = ->
			nowpad.log()
		
		# A document is preparing for sync
		everyone.now.nowpad_valueSyncDocument = (documentId, callback) ->
			# Fetch document
			nowpad.documents.fetch documentId, (err,document) =>
				# Error
				if err
					console.log err
					return
				
				# Fetch values
				state = document.state
				value = document.value
				delay = document.delay

				# Send back
				callback state, value, delay

				# Log
				console.log 'Valuing', @now.clientId, 'for document', documentId
			
		# Sync
		everyone.now.nowpad_patchSyncDocument = (documentId,clientState,patch,callback) ->
			# Fetch document
			nowpad.documents.fetch documentId, (err,document) =>
				# Error
				if err
					console.log err
					return
				
				# Prepare
				stateQueue = []
				document.state = document.state || 0

				# Log
				console.log '\nSyncing ['+@now.clientId+'/'+documentId+']'
				console.log document
				console.log ''

				# Update Client
				if clientState isnt document.state
					# Requires Updates

					# Add patches
					stateQueue = document.states.slice clientState
					
					# Log
					console.log 'Syncing from', clientState, 'to', document.state
					console.log stateQueue
					console.log ''

				# Update Server
				if patch
					# Update
					document.state++

					# Log
					console.log 'Received patch:', @now.clientId, 'from', clientState, 'to', document.state
					console.log patch
					console.log ''

					# State
					State =
						id: document.state
						patch: patch
						clientId: @now.clientId
					
					# Add
					stateQueue.push State
					document.states.push State

					# Apply
					result = nowpadCommon.applyPatch patch, document.value
					document.value = result.value

				# Return updates to client
				callback(stateQueue,document.state)
				
				# Notify other clients
				if patch
					# Notify nowpad clients
					everyone.now.nowpad_notifySync document.id, document.state

					# Notify application
					nowpad.trigger 'sync', [document.id, document.value, document.state]
		
	# Bind
	bind: (event,callback) ->
		if typeof @events[event] is 'undefined'
			throw new Error 'Unauthorised event: '+event
		else
			@events[event].push callback
	
	# Trigger
	trigger: (event,args) ->
		@events[event].forEach (callback) ->
			callback.apply(callback,args)

# API
nowpad =
	createInstance: (config) ->
		return new Nowpad(config)

# Export
module.exports = nowpad
