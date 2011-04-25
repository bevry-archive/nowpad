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
	value = '', states = [], locked = false, clientCount = 0, clients = {};

/**
 * Setup a new client
 */
everyone.connected(function(){
	// Generate an ID
	var id;
	while ( true ) {
		id = String(Math.floor(Math.random()*1000));
		if ( typeof clients[id] === 'undefined' ) {
			break;
		}
	}
	this.now.id = id;

	// Setup Client Information
	this.now.info = clients[id] = {
		id: id
	};

	// Increment Count
	++clients;

	// Log
	console.log("Joined:", this.now.id);
});

/**
 * Destroy an old client
 */
everyone.disconnected(function(){
	// Delete Client Information
	delete clients[this.now.id];

	// Decrement Count
	--clients;

	// Log
	console.log("Left:", this.now.id);
});

/**
 * Meet the client
 * @return {integer} id
 */
everyone.now.meet = function(_notify,_callback){
	// Check
	if ( typeof _notify !== 'function' ) {
		console.log('Evil client');
		return false;
	}

	// Apply Notify
	this.now.notify = _notify;

	// Next
	_callback(this.now.id);
};

/**
 * Lock the pad
 * @return {boolean} was the lock successful
 */
everyone.now.lock = function(_callback){
	// Prepare
	var result = false;

	// Check
	if ( !locked ) {
		// Lock
		locked = this.now.id;

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
	locked = false;

	// Log
	// console.log('Unlocked:', this.now.id);
};

/**
 * Log
 */
everyone.now.log = function(){
	console.log({
		lock: locked,
		clientCount: clientCount,
		clients: clients
	});
};

/**
 * Send the Patch
 */
everyone.now.sync = function(_state,_patch,_callback){
	// Prepare
	var result, patches = [], i, n = states.length;

	// Check State
	if ( _state !== n ) {
		// Requires Updates
		console.log('Synching:', this.now.id, 'from', _state, 'to', n);

		// Add Prior Patches
		for ( i=_state||0; i<n; ++i ) {
			patches.push(states[i]);
		}
	}

	// Handle
	if ( _patch ) {
		// We have a difference
		console.log('Received Patch:', this.now.id, n+1, _patch);

		// Add Patch
		patches.push(_patch);
		states.push(_patch);
		++n;

		// Apply Patch
		result = nowpadCommon.applyPatch(_patch,value);
		value = result.value;

		// Log
		// console.log(value);
	}

	// Return Patches
	_callback(patches,n);

	// Notify
	if ( _patch ) {
		everyone.now.notify(n);
	}
};
