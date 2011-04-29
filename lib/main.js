// Prepare
var
	fs = require("fs"),
	now = require("now"),
	es5 = require("es5-shim"),
	nowpadCommon = require(__dirname+"/public/common.js").nowpadCommon;
	nowpad = {
		// Server
		app: null,
		everyone: null,
		filePath: __dirname,
		fileNames: ['public/diff_match_patch.js','public/common.js','public/client.js'],
		fileString: '',

		// NowPad
		value: '',
		states: [],
		offset: 0,
		locked: false,
		delay: 50,
		clientCount: 0,
		clients: {},

		// Event Management
		events: {
			sync: []
		},

		/**
		 * Init NowPad
		 */
		init: function(){
			// Prepare
			var
				nowpad = this,
				i,n;

			// Files
			this.fileNames.forEach(function(value){
				// Prepare
				var filePath = nowpad.filePath+'/'+value;

				// Read
				fs.readFile(filePath, 'utf8', function (err, data) {
					if (err) throw err;
					// Store
					nowpad.fileString += data;
				});
			});
		},

		/**
		 * Setup NowPad with the Server
		 */
		setup: function(app){
			// Prepare
			var nowpad = this;

			// Bind Server
			this.app = app;

			// Routes
			this.app.get('/nowpad/nowpad.js', function(req, res){
        res.writeHead(200, {'content-type': 'text/javascript'});
        res.write(nowpad.fileString);
        res.end();
      });

      // Initialise Now
			this.everyone = now.initialize(this.app, {clientWrite: false});

			// Bind Now
			with ( {everyone:this.everyone,app:this.app} ) {
				/**
				 * Setup a new client
				 */
				everyone.connected(function(){
					// Generate an ID
					var id;
					while ( true ) {
						id = String(Math.floor(Math.random()*1000));
						if ( typeof nowpad.clients[id] === 'undefined' ) {
							break;
						}
					}
					this.now.id = id;

					// Setup Client Information
					this.now.info = nowpad.clients[id] = {
						id: id
					};

					// Increment Count
					++nowpad.clientCount;

					// Log
					console.log("Joined:", this.now.id);
				});

				/**
				 * Destroy an old client
				 */
				everyone.disconnected(function(){
					// Delete Client Information
					delete nowpad.clients[this.now.id];

					// Decrement Count
					--nowpad.clientCount;

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
					_callback(this.now.id,nowpad.delay);
				};

				/**
				 * Change the delay
				 */
				everyone.now.delayChange = function(_delay){
					// Handle
					nowpad.delay = _delay;

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
					if ( !nowpad.locked ) {
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
						clientCount: nowpad.clientCount,
						clients: nowpad.clients
					});
				};

				/**
				 * Send the Patch
				 */
				everyone.now.sync = function(_state,_patch,_callback){
					// Prepare
					var result, states = [], i, n = nowpad.states.length, state;

					// Log
					console.log('Sync:', this.now.id);

					// Check State
					if ( _state !== n ) {
						// Requires Updates
						console.log('Synching:', this.now.id, 'from', _state, 'to', n);

						// Add Prior Patches
						for ( i=_state||0; i<n; ++i ) {
							states.push(nowpad.states[i]);
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
						nowpad.states.push(state);
						++n;

						// Apply Patch
						result = nowpadCommon.applyPatch(_patch,nowpad.value);
						nowpad.value = result.value;

						// Log
						// console.log(value);
					}

					// Return Patches
					_callback(states,n);

					// Sync Notify
					if ( _patch ) {
						// Notify Client
						everyone.now.syncNotify(n);

						// Notify Server
						nowpad.trigger('sync',[nowpad.value]);
					}
				}; // </everyone.sync>
			} // </nowpad.bind.with>
		}, // </nowpad.bind>

		/**
		 * Provide Event Binding
		 */
		bind: function(event,callback){
			this.events[event].push(callback);
		},

		/**
		 * Provide Event Triggering
		 */
		trigger: function(event,args){
			this.events[event].forEach(function(value){
				value.apply(value,args);
			});
		}
	}; // </nowpad>

// Initialise
nowpad.init();

// Export
module.exports = nowpad;
