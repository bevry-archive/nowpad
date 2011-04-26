(function(window,undefined){
	"use strict";

	// Prepare
	var
		jQuery = window.jQuery, $ = jQuery,
		console = window.console,
		nowpadCommon = window.nowpadCommon,
		nowpadClient = window.nowpadClient = {
			// Elements
			$stat: null,
			state: null,
			$doc: null,
			doc: null,

			// Synchronisation
			lastSyncedValue: '',
			lastCurrentValue: '',
			lastSyncedState: false,
			newSyncedState: false,
			newSyncedStates: [],
			selectionStart: 0,
			selectionEnd: 0,

			// Misc
			id: null,
			timer: false,
			timerDelay: 50,
			isTyping: false,
			inRequest: false,

			/**
			 * Initialise our Client
			 */
			init: function(){
				// Prepare
				var me = this;

				// Check Browser
				if ( $.browser.msie || typeof console === 'undefined' || typeof console.log === 'undefined' ) {
					throw Error('Your browser is not supported yet');
				}

				// Now
				window.now.ready(function(){
					// Bind Now
					window.now.meet(
						// Sync Notify
						function(_state){
							// We've received a change
							if ( _state !== me.lastSyncedState ) {
								// And it's not our change
								me.reset();
							}
						},
						// Delay Notify
						function(_delay){
							// We've received a delay change
							if ( me.timerDelay !== _delay ) {
								me.timerDelay = _delay;
								alert('Sync delay changed to: '+_delay+'ms');
							}
						},
						// Callback
						function(_id,_delay){
							// Apply Id
							document.title = me.id = _id;

							// Apply Delay
							me.timerDelay = _delay;
							alert('Initialised with a sync delay of: '+_delay+'ms');

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

				// Keyup
				me.$doc.keyup(function(){
					me.reset();
				});

				// Delay Toggles
				$('#delayIncrease').click(function(){
					if ( me.timerDelay <= 3050 ) {
						window.now.delayChange(me.timerDelay + 500);
					}
					else {
						alert('Already at the max delay of: '+me.timerDelay);
					}
				});
				$('#delayDecrease').click(function(){
					if ( me.timerDelay >= 550 ) {
						window.now.delayChange(me.timerDelay - 500);
					}
					else {
						alert('Already at the min delay of: '+me.timerDelay);
					}
				});
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
				this.isTyping = true;

				// Initialise
				this.timer = window.setTimeout(function(){
					this.isTyping = false;
					me.request();
				},this.timerDelay);
			},

			/**
			 * Prepare a Request for Synchronisation
			 */
			request: function(){
				// Prepare
				var me = this, patch = null;

				// Status
				if ( !this.id ) {
					return false;
				}

				// Lock
				if ( this.inRequest ) {
					// Locked
					return false;
				}
				this.inRequest = true;

				// Update
				this.sync();

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

						// Update current value
						me.lastCurrentValue = me.doc.value;

						// Retrieve our patch
						patch = nowpadCommon.createPatch(me.lastSyncedValue, me.lastCurrentValue);

						// Log
						// console.log('Sync send: ['+me.lastSyncedState+'] ['+patch+'] ['+me.lastSyncedValue+'] ['+me.lastCurrentValue+']');

						// Synchronise
						window.now.sync(me.lastSyncedState, patch, function(_states,_state){
							// Log
							// console.log('Sync receive:',_patches,_state,this.lastSyncedState,_state);

							// Updates?
							if ( _states.length ) {
								// Log
								// console.log('Applying', _patches, _state);

								// Synchronise
								me.newSyncedStates = _states;
								me.newSyncedState = _state;

								// Apply the Changes when the user has stopped typing
								if ( this.isTyping ) {
									me.reset();
								}
								else {
									me.sync();
								}
							}

							// Unlock
							window.now.unlock();

							// Feedback
							me.$doc.removeClass('syncing');
							me.inRequest = false;
						});
					}
					// Fail
					else {
						// We didn't get the lock
						// console.log('Locking failed');

						// Feedback
						me.$doc.removeClass('syncing');
						me.inRequest = false;

						// Try Again Later
						me.reset();
					}
				});
			},

			/**
			 * Apply the Client and Server Changes
			 */
			sync: function(){
				// Prepare
				var
					i, state,
					// Local Values
					lastCurrentValue = this.lastCurrentValue,
					newCurrentValue = this.doc.value,
					// Synced Values
					lastSyncedState = this.lastSyncedState,
					newSyncedStates = this.newSyncedStates,
					newSyncedState = this.newSyncedState,
					newSyncedValue = this.lastSyncedValue;

				// Check if we have something to do
				if ( !newSyncedStates.length ) {
					// Nothing to do
					return false;
				}

				// Get Cursor Positions
				this.selectionStart = this.doc.selectionStart;
				this.selectionEnd = this.doc.selectionEnd;

				// Apply Synced Patches
				for ( i=0; i<newSyncedStates.length; ++i ) {
					// Apply Patch
					state = newSyncedStates[i];
					console.log('remote:', state);
					newSyncedValue = this.apply(state,newSyncedValue);
				}

				// Compare Local Changes
				if ( lastCurrentValue !== newCurrentValue ) {
					// Generate and Apply the Patch to Synced Changes
					state = {
						patch: nowpadCommon.createPatch(lastCurrentValue, newCurrentValue),
						client: this.id
					};
					console.log('local:', state);
					newCurrentValue = this.apply(state,newSyncedValue);
				}
				else {
					// Apply Synced Changes
					newCurrentValue = newSyncedValue;
				}

				// Has Changes?
				if ( this.doc.value !== newCurrentValue ) {
					console.log('applying cursor: ', this.doc.selectionStart, 'to', this.selectionStart);

					// Apply Changes
					this.doc.value = newCurrentValue;

					// Update Cursor
					this.doc.selectionStart = this.selectionStart;
					this.doc.selectionEnd = this.selectionEnd;
				}

				// Apply Sync Changes
				this.newSyncedStates = [];
				this.newSyncedState = false;
				this.lastSyncedState = newSyncedState;
				this.lastSyncedValue = newSyncedValue;
				this.lastCurrentValue = newSyncedValue;
			},

			/**
			 * Apply a patch to our state
			 */
			apply: function(_state,_value){
				// Prepare
				var patchResult, patchValue;

				// Sync Value
				patchResult = nowpadCommon.applyPatch(_state.patch,_value,this.selectionStart,this.selectionEnd);
				patchValue = patchResult.value;

				// Sync and Apply Cursor
				if ( _value !== patchValue && _state.client !== this.id ) {
					console.log('updating cursor: ', this.selectionStart, 'to', patchResult.selectionStart);
					this.selectionStart = patchResult.selectionStart;
					this.selectionEnd = patchResult.selectionEnd;
				}

				// Return
				return patchValue;
			}
		}
	;

	// Initialise Client
	nowpadClient.init();

})(window);
