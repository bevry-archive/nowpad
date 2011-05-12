# Require
fs = require 'fs'
now = require 'now'
nowpadCommon = require __dirname+'/public/common.js'
nowpad =
	# Server
	app: null
	everyone: null
	filePath: __dirname
	fileNames: [
		'public/diff_match_patch.js'
		'public/common.js'
		'public/client.js'
	]
	fileString: ''

	# Nowpad
	value: ''
	state: false
	states: []
	offset: 0
	locked: false
	clientCount: 0
	clients: {}

	# Options
	delay: 200
	
	# Events
	events:
		sync: []
	
	# Initialise
	init: ->
		nowpad.cacheClientScript()
	
	# Cache the client script
	cacheClientScript: ->
		nowpad.fileString = ''
		nowpad.fileNames.forEach (value) ->
			filePath = nowpad.filePath+'/'+value
			fs.readFile filePath, 'utf8', (err,data) ->
				throw err if err
				nowpad.fileString += data
	
	# Server the client script
	serveClientScript: (req,res) ->
		res.writeHead 200, 'content-type': 'text/javascript'
		res.write nowpad.fileString
		res.end()
	
	# Setup
	setup: (app) ->
		# Bind
		nowpad.app = app

		# Routes
		nowpad.app.get '/nowpad/nowpad.js', nowpad.serveClientScript
		
		# Now
		nowpad.nowInit()

	# Initialise Now.js
	nowInit:
		# Bind now to server
		everyone = now.initialise nowpad.app, clientWrite: false

		# Connected
		everyone.connected = ->
			# Generate id
			while true
				id = String Math.floor Math.random()*1000
				if typeof nowpad.clients[id] is 'undefined'
					break
			
			# Send client information
			@now.id = id
			@now.info = nowpad.clients[id] =
				id: id
			
			# Increment count
			++nowpad.clientCount

			# Log
			console.log 'Connected:',@now.id

		# Disconnected
		everyone.disconnected = ->
			# Delete client
			delete nowpad.clients[@now.id]

			# Decrement count
			--nowpad.clientCount

			# Log
			console.log 'Disconnected:', @now.id
		
		# Meet
		everyone.now.meet = (syncNotify,delayNotify,callback) ->
			# Check
			if (typeof syncNotify isnt 'function') or (typeof delayNotify isnt 'function')
				console.log 'Evil client'
				return false
			
			# Apply
			@now.syncNotify = syncNotify
			@now.delayNotify = delayNotify

			# Next
			callback @now.id, nowpad.delay, nowpad.value, nowpad.state

		# Lock
		everyone.now.lock = (callback) ->
			if !nowpad.locked
				nowpad.locked = @now.id
				result = true
			else
				result = false
			callback result
		
		# Unlock
		everyone.now.unlock = ->
			nowpad.locked = false
		
		# Log
		everyone.now.log = ->
			console.log(
				lock: nowpad.locked
				clientClient: nowpad.clientCount
				clients: nowpad.clients
			)
		
		# Sync
		everyone.now.sync = (state,patch,callback) ->
			# Prepare
			states = []
			nowpad.state = nowpad.state || 0

			# Log
			console.log 'Sync:', @now.id

			# Update Client
			if state isnt nowpad.state
				# Requires Updates
				console.log 'Syncing:', @now.id, 'from', state, 'to', nowpad.state

				# Add patches
				states = nowpad.states.slice state
			
			# Update Server
			if patch
				# Update
				++nowpad.state

				# Log
				console.log 'Received patch:', @now.id, 'from', state, 'to', nowpad.state

				# State
				State =
					patch: patch
					client: @now.id
				
				# Add
				states.push State
				nowpad.states.push State

				# Apply
				result = nowpadCommon.applyPatch patch, nowpad.value
				nowpad.value = result.value
			
			# Return updates to client
			callback(states,nowpad.state)
			
			# Notify other clients
			if patch
				# Notify nowpad clients
				everyone.now.syncNotify nowpad.state

				# Notify application
				nowpad.trigger 'sync', [nowpad.value, nowpad.state]
	
	# Bind
	bind: (event,callback) ->
		nowpad.events[event].push callback
	
	# Trigger
	trigger: (event,args) ->
		nowpad.events[event].forEach (callback) ->
			callback.apply(callback,args)

# Initialise
nowpad.init()

# Export
module.exports = nowpad
