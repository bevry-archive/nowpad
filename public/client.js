(function(window,undefined){
	// Prepare
	var
		jQuery = window.jQuery, $ = jQuery,
		nowpadCommon = window.nowpadCommon,
		nowpadClient = {
			// Elements
			$stat: null,
			state: null,
			$doc: null,
			doc: null,

			// Variables
			id: null,
			lastValue: '',
			currentState: false,
			timer: false,
			timerDelay: 1000,

			/**
			 * Initialise our Client
			 */
			init: function(){
				// Prepare
				var me = this;

				// domReady
				$(function(){
					me.domReady();
				});
			},

			/**
			 * Initialise on domReady
			 */
			domReady: function(){
				// Prepare
				var me = this;

				// Elements
				this.$stat = $('#stat');
				this.state = this.$stat.get(0);
				this.$doc = $('#doc');
				this.doc = this.$doc.get(0);

				// Bind Now
				window.now.registered = function(_id){
					// Registered
					me.registered(_id);

					// Bind Dom
					this.$doc.keyup(function(){
						me.reset();
					});
				};
			},

			/**
			 * Register a Client Instance with the Server
			 */
			registered: function(_id){
				// Apply Id
				document.title = this.id = _id;

				// Init Sync
				this.reset();
			},

			/**
			 * Synchronise the Client between the Server
			 */
			sync: function(_patches,_newState){
				// Prepare
				var i, newValue = this.lastValue, a, z;

				// Cursor Positions
				a = this.doc.selectionStart;
				z = this.doc.selectionEnd;

				// Apply Patches
				for ( i=0; i<_patches.length; ++i ) {
					// Apply Patch
					result = nowpadCommon.applyPatch(_patches[i],newValue,a,z);
					newValue = result.value;
					if ( doc.value !== newValue ) {
						a = result.a;
						z = result.z;
					}
				}

				// Update Value
				this.currentState = _newState;
				this.lastValue = doc.value = newValue;

				// Cursor Positions
				this.doc.selectionStart = a;
				this.doc.selectionEnd = z;
			},

			/**
			 * Clear a Request for Synchronisation
			 */
			clear: function(){
				// Handle
				if ( this.timer ) {
					clearTimeout(this.timer);
					this.timer = false;
				}
			},

			/**
			 * Reset a Request for Synchronisation
			 */
			reset: function(){
				// Prepare
				var me = this;

				// Clear
				this.clear();

				// Initialise
				this.timer = setTimeout(function(){
					me.request();
				},this.timerDelay);
			},

			/**
			 * Prepare a Request for Synchronisation
			 */
			request: function(){
				// Prepare
				var me = this, patch;

				// Log
				// console.log('Locking');

				// Grab a Lock
				window.now.lock(function(_result){
					// Success
					if ( _result ) {
						// We got the lock
						// console.log('Synching');

						// Retrieve our patch
						patch = nowpadCommon.createPatch(me.lastValue, doc.value),

						// Synchronise
						window.now.sync(me.currentState, patch, function(_patches,_newState){
							// Updates?
							if ( _patches.length ) {
								// Log
								console.log('Applying', _patches, _newState);

								// Synchronise
								me.sync(_patches,_newState);
							}

							// Unlock
							window.now.unlock();

							// Sync Later
							me.reset();
						});
					}
					// Fail
					else {
						// We didn't get the lock
						// console.log('Locking failed');

						// Sync Later
						me.reset();
					}
				});
			}
		};

	// Initialise Client
	nowpadClient.init();

})(window);
