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
	everyone = now.initialize(app),
	value = '', locked = false, clients = 0, clientsReady = 0;

/**
 * Setup a new client
 */
everyone.connected(function(){
	++clients;
	console.log("Joined: " + this.now.name);
	this.now.loadPad(value);
});

/**
 * Destroy an old client
 */
everyone.disconnected(function(){
	--clients;
	console.log("Left: " + this.now.name);
});

/**
 * Lock the pad
 */
everyone.now.lock = function(_callback){
	console.log('Locked');
	locked = this.now.name;
	_callback(locked);
};

/**
 * Unlock the pad
 */
everyone.now.unlock = function(){
	console.log('Unlocked');
	locked = false;
};

/**
 * Send the Value
 */
everyone.now.sendValue = function(_value,_callback){
	console.log('Received Value');
	value = _value;
	_callback(true);
};

/**
 * Fetch the Value
 */
everyone.now.fetchValue = function(_callback){
	_callback(value);
};

/**
 * Send the Patch
 */
everyone.now.sendPatch = function(_patch,_hash,_callback){
	// Prepare
	var result;

	// Lock
	clientsReady = 0;

	// Apply
	console.log('Received Patch');
	result = nowpadCommon.applyPatch(_patch,value);
	if ( !result.pass ) {
		console.log('Failed Patch');
		_callback(false);
		return;
	}
	value = result.value;

	// Compare
	if ( nowpadCommon.hash(value) !== _hash ) {
		// Conflict
		console.log('Failed Hash');
		_callback(false);
	}
	else {
		// Patch Successfully
		everyone.now.applyPatch(this.now.name,_patch,_hash,function(){
			// Applied
			console.log('Applied Patch')
			++clientsReady;

			// Unlock
			if ( clientsReady === clients ) {
				console.log('Completed Patching')
				_callback(true);
			}
		});
	}
};
