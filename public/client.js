(function(window,undefined){
	// Prepare
	var
		jQuery = window.jQuery, $ = jQuery,
		nowpadCommon = window.nowpadCommon,
		nowpadClient = window.nowpadClient = {
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

				// Now
				window.now.ready(function(){
					// Bind Now
					window.now.meet(
						// Notify
						function(_state){
							if ( _state !== me.currentState ) {
								me.reset();
							}
						},
						// Callback
						function(_id){
							// Apply Id
							document.title = me.id = _id;

							// Init Sync
							me.reset();
						}
					);
				});

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
				this.$doc = $('#doc');
				this.doc = this.$doc.get(0);

				// Events
				me.$doc.keyup(function(){
					me.reset();
				});
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
					if ( this.doc.value !== newValue ) {
						a = result.a;
						z = result.z;
					}
				}

				// Update Value
				this.currentState = _newState;
				this.lastValue = this.doc.value = newValue;

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
					window.clearTimeout(this.timer);
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
				this.timer = window.setTimeout(function(){
					me.request();
				},this.timerDelay);
			},

			/**
			 * Prepare a Request for Synchronisation
			 */
			request: function(){
				// Prepare
				var me = this, patch;

				// Status
				if ( !this.id ) {
					return false;
				}

				// Log
				// console.log('Locking');

				// Feedback
				this.$doc.addClass('syncing');

				// Grab a Lock
				window.now.lock(function(_result){
					// Success
					if ( _result ) {
						// We got the lock
						// console.log('Synching');

						// Retrieve our patch
						patch = nowpadCommon.createPatch(me.lastValue, me.doc.value);

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

							// Feedback
							me.$doc.removeClass('syncing');
						});
					}
					// Fail
					else {
						// We didn't get the lock
						// console.log('Locking failed');

						// Feedback
						me.$doc.removeClass('syncing');

						// Try Again Later
						me.reset();
					}
				});
			}
		};

	// Initialise Client
	nowpadClient.init();

})(window);
