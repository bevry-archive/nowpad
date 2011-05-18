// Prepare
var
	// Require
	express = require('express'),
	coffee = require('coffee-script'),
	nowpad = require(__dirname+'/../../lib/nowpad.coffee'),
	// Server
	app = express.createServer();

// Configuration
app.configure(function(){
	// Standard
	app.use(express.methodOverride());
	app.use(express.errorHandler());

	// Routing
	app.use(app.router);
	app.use(express.static(__dirname));

	// Views
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());

	// Nowpad
	nowpad.setup(app);
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

// NowPad
nowpad.bind('sync',function(value){
	// ...
});
