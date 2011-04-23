// Require
var
	connect = require('connect'),
	express = require('express'),
	now = require("now");

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
	locked = false, clients = 0, clientsReady = 0;

// Binds
everyone.connected(function(){
	++clients;
	console.log("Joined: " + this.now.name);
});
everyone.disconnected(function(){
	--clients;
	console.log("Left: " + this.now.name);
});
everyone.now.sendPatch = function(patch,callback){
	var result = false;
	if ( !locked ) {
		locked = this.now.name;
		clientsReady = 0;
		console.log('Received Message: '+this.now.name,patch);
  	everyone.now.applyPatch(this.now.name,patch,function(){
  		console.log('Released: ',this.now.name,clientsReady)
			++clientsReady;
			if ( clientsReady === clients ) {
				locked = false;
			}
  	});
  	result = true;
  }
  else {
  	console.log('Waiting: ',locked,clientsReady);
  }
  callback(result);
};
