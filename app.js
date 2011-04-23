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
app.listen(8080);
console.log("Express server listening on port %d", app.address().port);

// Now
var
	everyone = now.initialize(app),
	value = '', locked = false, clients = 0, clientsReady = 0;

// Binds
everyone.connected(function(){
	++clients;
	console.log("Joined: " + this.now.name);
	this.now.loadPad(value);
});
everyone.disconnected(function(){
	--clients;
	console.log("Left: " + this.now.name);
});
everyone.now.sendPatch = function(_patches,_callback){
	// Prepare
	var result = false;
	if ( !locked ) {
		// Lock
		locked = this.now.name;
		clientsReady = 0;

		// Apply
		console.log('Received Message: '+this.now.name,_patches);
		for ( var i=0,n=_patches.length; i<n; ++i ) {
			value = nowpadCommon.applyPatch(_patches[i],value).value;
		}

		// Forward
  	everyone.now.applyPatch(this.now.name,_patches,function(){
  		// Applied
  		console.log('Released: ',this.now.name,clientsReady)
			++clientsReady;

			// Unclock
			if ( clientsReady === clients ) {
				locked = false;
			}
  	});
  	result = true;
  }
  else {
  	console.log('Waiting: ',locked,clientsReady);
  }

  // Forward
  _callback(result);
};
