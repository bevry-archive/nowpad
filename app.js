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
	everyone = now.initialize(app);

// Binds
everyone.connected(function(){
	console.log("Joined: " + this.now.name);
});
everyone.disconnected(function(){
	console.log("Left: " + this.now.name);
});
everyone.now.distributeMessage = function(patches){
	console.log('Received Message');
  everyone.now.receiveMessage(this.now.name, patches);
};
