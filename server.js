// Require
var
	connect = require('connect'),
	express = require('express'),
	now = require("now"),
	nowpadCommon = require(__dirname+"/public/common.js").nowpadCommon;

// Server
var
	app = express.createServer();

// Configuration
app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.static(__dirname)); //  + '/public'
  app.use(express.errorHandler());
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
});

// Routes
app.get('/', function(req, res){
  res.render('doc', {locals: {
    title: 'NowPad!'
  }});
});

// Init
app.listen(9572);
console.log("Express server listening on port %d", app.address().port);

// Now
var
	everyone = now.initialize(app, {clientWrite: false}),
	nowpadServer = {
		// Variables
		value: '',
		states: [],
		offset: 0,
		locked: false,
		delay: 50,
		clientCount: 0,
		clients: {}
	};

/**
 * Setup a new client
 */
everyone.connected(function(){
	// Generate an ID
	var id;
	while ( true ) {
		id = String(Math.floor(Math.random()*1000));
		if ( typeof nowpadServer.clients[id] === 'undefined' ) {
			break;
		}
	}
	this.now.id = id;

	// Setup Client Information
	this.now.info = nowpadServer.clients[id] = {
		id: id
	};

	// Increment Count
	++nowpadServer.clientCount;

	// Log
	console.log("Joined:", this.now.id);
});

/**
 * Destroy an old client
 */
everyone.disconnected(function(){
	// Delete Client Information
	delete nowpadServer.clients[this.now.id];

	// Decrement Count
	--nowpadServer.clientCount;

	// Log
	console.log("Left:", this.now.id);
});

/**
 * Meet the client
 * @return {integer} id
 */
everyone.now.meet = function(_syncNotify,_delayNotify,_callback){
	// Check
	if ( typeof _syncNotify !== 'function' || typeof _delayNotify !== 'function' ) {
		console.log('Evil client');
		return false;
	}

	// Apply Notifies
	this.now.syncNotify = _syncNotify;
	this.now.delayNotify = _delayNotify;

	// Next
	_callback(this.now.id,nowpadServer.delay);
};

/**
 * Change the delay
 */
everyone.now.delayChange = function(_delay){
	// Handle
	nowpadServer.delay = _delay;

	// Notify
	everyone.now.delayNotify(_delay);
};

/**
 * Lock the pad
 * @return {boolean} was the lock successful
 */
everyone.now.lock = function(_callback){
	// Prepare
	var result = false;

	// Check
	if ( !nowpadServer.locked ) {
		// Lock
		this.locked = this.now.id;

		// Log
		// console.log('Locked:', this.now.id);

		// Result
		result = true;
	}

	// Next
	_callback(result);
};

/**
 * Unlock the pad
 */
everyone.now.unlock = function(){
	// Unlock
	this.locked = false;

	// Log
	// console.log('Unlocked:', this.now.id);
};

/**
 * Log
 */
everyone.now.log = function(){
	console.log({
		lock: this.locked,
		clientCount: nowpadServer.clientCount,
		clients: nowpadServer.clients
	});
};

/**
 * Send the Patch
 */
everyone.now.sync = function(_state,_patch,_callback){
	// Prepare
	var result, states = [], i, n = nowpadServer.states.length, state;

	// Log
	console.log('Sync:', this.now.id);

	// Check State
	if ( _state !== n ) {
		// Requires Updates
		console.log('Synching:', this.now.id, 'from', _state, 'to', n);

		// Add Prior Patches
		for ( i=_state||0; i<n; ++i ) {
			states.push(nowpadServer.states[i]);
		}
	}

	// Handle
	if ( _patch ) {
		// We have a difference
		console.log('Received Patch:', this.now.id, 'from', _state, 'to', n+1, 'patch:', _patch);

		// Create State
		state = {
			patch: _patch,
			client: this.now.id
		};

		// Add Patch
		states.push(state);
		nowpadServer.states.push(state);
		++n;

		// Apply Patch
		result = nowpadCommon.applyPatch(_patch,nowpadServer.value);
		nowpadServer.value = result.value;

		// Log
		// console.log(value);
	}

	// Return Patches
	_callback(states,n);

	// Sync Notify
	if ( _patch ) {
		everyone.now.syncNotify(n);
	}
};
