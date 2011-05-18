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

// Initialise documents
nowpad.addDocument('doc1','this is doc1');
nowpad.addDocument('doc2','this is doc2');

// Fires when an unknown document is requested
nowpad.requestDocument(function(documentId,callback){
	// nowpad.addDocument(documentId);
	// callback(true);
	callback(false);
});

// Fires when a change is synced to the document
nowpad.bind('sync',function(document,value){
	// ...
});

// Fires when all the clients have disconnected from a document
nowpad.bind('disconnected', function(document,value){
	
});