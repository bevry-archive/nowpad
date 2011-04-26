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
			newSyncedPatches: [],
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
						// Notify
						function(_state){
							// We've received a change
							if ( _state !== me.lastSyncedState ) {
								// And it's not our change
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
						window.now.sync(me.lastSyncedState, patch, function(_patches,_state){
							// Log
							// console.log('Sync receive:',_patches,_state,this.lastSyncedState,_state);

							// Updates?
							if ( _patches.length ) {
								// Log
								// console.log('Applying', _patches, _state);

								// Synchronise
								me.newSyncedPatches = _patches;
								me.newSyncedState = _state;

								// Apply the Changes when the user has stopped typing
								if ( this.isTyping ) {
									me.reset();
								}
								else {
									me.sync(_patches.length === 1 && _patches[0] === patch);
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
			sync: function(_ignoreCursor){
				// Prepare
				var
					i, patch,
					// Local Values
					lastCurrentValue = this.lastCurrentValue,
					newCurrentValue = this.doc.value,
					// Synced Values
					lastSyncedState = this.lastSyncedState,
					newSyncedPatches = this.newSyncedPatches,
					newSyncedState = this.newSyncedState,
					newSyncedValue = this.lastSyncedValue;

				// Check if we have something to do
				if ( !newSyncedPatches.length ) {
					// Nothing to do
					return false;
				}

				// Cursor?
				if ( _ignoreCursor ) {
					// Get Cursor Positions
					this.selectionStart = this.doc.selectionStart;
					this.selectionEnd = this.doc.selectionEnd;
				}

				// Apply Synced Patches
				for ( i=0; i<newSyncedPatches.length; ++i ) {
					console.log('remote');
					// Apply Patch
					patch = newSyncedPatches[i];
					newSyncedValue = this.apply(patch,newSyncedValue,_ignoreCursor);
				}

				// Compare Local Changes
				if ( lastCurrentValue !== newCurrentValue ) {
					console.log('local');
					// Generate and Apply the Patch to Synced Changes
					patch = nowpadCommon.createPatch(lastCurrentValue, newCurrentValue);
					newCurrentValue = this.apply(patch,newSyncedValue,_ignoreCursor);
				}
				else {
					// Apply Synced Changes
					newCurrentValue = newSyncedValue;
				}

				// Apply Local Changes
				this.doc.value = newCurrentValue;

				// Cursor?
				if ( _ignoreCursor ) {
					// Update Cursor
					this.doc.selectionStart = this.selectionStart;
					this.doc.selectionEnd = this.selectionEnd;
				}

				// Apply Sync Changes
				this.newSyncedPatches = [];
				this.newSyncedState = false;
				this.lastSyncedState = newSyncedState;
				this.lastSyncedValue = newSyncedValue;
				this.lastCurrentValue = newSyncedValue;
			},

			/**
			 * Apply a patch to our state
			 */
			apply: function(_patch,_value,_ignoreCursor){
				// Prepare
				var patchResult, patchValue;

				// Sync Value
				patchResult = nowpadCommon.applyPatch(_patch,_value,this.selectionStart,this.selectionEnd);
				patchValue = patchResult.value;

				// Sync and Apply Cursor
				if ( !_ignoreCursor && _value !== patchValue && this.doc.value !== patchValue ) {
					console.log('['+this.doc.value+']['+_value+']\n['+patchValue+']');
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
