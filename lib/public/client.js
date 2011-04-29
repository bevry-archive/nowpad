(function(window,undefined){
	"use strict";
	// Prepare
	var
		jQuery = window.jQuery, $ = jQuery,
		console = window.console,
		nowpadCommon = window.nowpadCommon,
		nowpadClient = window.nowpadClient = function(options){
			var key,value;
			for ( key in options ) {
				if ( options.hasOwnProperty(key) ) {
					this[key] = options[key];
				}
			}
			this.init();
		};

	// Nowpad Client
	nowpadClient.prototype = {
		// Pad
		pad: null,
		padType: null,

		// Synchronisation
		lastSyncedValue: '',
		lastCurrentValue: '',
		lastSyncedState: false,
		newSyncedState: false,
		newSyncedStates: [],
		selectionRange: {
			selectionStart: 0,
			selectionEnd: 0
		},

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

			// Handle Pad
			if ( typeof this.pad.getSession !== 'undefined' ) {
				// We have ace
				this.padType = 'ace';
			}
			else if ( this.pad instanceof jQuery ) {
				// we have jquery element
				this.padType = 'jquery';
			}
			else if ( this.pad instanceof Element ) {
				// We have a native element
				this.padType = 'native';
			}
			else {
				// Unknown
				throw new Error('Unknown Pad');
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
					function(_id,_delay,_value,_state){
						// Apply Id
						document.title = me.id = _id;

						// Apply Delay
						me.timerDelay = _delay;
						console.log('Initialised with a sync delay of: '+_delay+'ms');

						// Apply the value
						me.setValue(me.lastCurrentValue = me.lastSyncedValue = _value);
						me.lastSyncedState = _state;

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

			// Keyup
			this.change(function(){
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
			this.addClass('sync');

			// Grab a Lock
			window.now.lock(function(_result){
				// Success
				if ( _result ) {
					// We got the lock
					// console.log('Synching');

					// Update current value
					me.lastCurrentValue = me.getValue();

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
						me.removeClass('sync');
						me.inRequest = false;
					});
				}
				// Fail
				else {
					// We didn't get the lock
					// console.log('Locking failed');

					// Feedback
					me.removeClass('sync');
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
				newCurrentValue = this.getValue(),
				// Synced Values
				lastSyncedState = this.lastSyncedState,
				newSyncedStates = this.newSyncedStates,
				newSyncedState = this.newSyncedState,
				newSyncedValue = this.lastSyncedValue,
				// Range
				selectionRange;

			// Check if we have something to do
			if ( !newSyncedStates.length ) {
				// Nothing to do
				return false;
			}

			// Get Cursor Positions
			this.selectionRange = this.getSelectionRange();

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
			if ( this.getValue() !== newCurrentValue ) {
				console.log('applying cursor: ', this.selectionRange);

				// Apply Changes
				this.setValue(newCurrentValue);

				// Update Cursor
				this.setSelectionRange(this.selectionRange,newCurrentValue);
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
			patchResult = nowpadCommon.applyPatch(_state.patch,_value,this.selectionRange);
			patchValue = patchResult.value;

			// Sync and Apply Cursor
			if ( this.padType === 'ace' || (_value !== patchValue && _state.client !== this.id) ) {
				console.log('updating cursor: ', this.selectionRange, [_value !== patchValue], [_state.client !== this.id]);
				this.selectionRange = patchResult.selectionRange;
			}

			// Return
			return patchValue;
		},


		/**
		 * Pad Change Event
		 */
		change: function(callback){
			switch ( this.padType ) {
				case 'ace':
					this.pad.getSession().on('change',callback);
					break;

				case 'jquery':
					this.pad.keyup(callback);
					break;

				case 'native':
					this.pad.addEventListener('change',callback,false);
					break;
			}
		},

		/**
		 * Get Pad Value
		 */
		getValue: function(){
			var result;

			switch ( this.padType ) {
				case 'ace':
					result = this.pad.getSession().getValue();
					break;

				case 'jquery':
					result = this.pad.val();
					break;

				case 'native':
					result = this.pad.value;
					break;
			}

			return result;
		},

		/**
		 * Set Pad Value
		 */
		setValue: function(value){
			switch ( this.padType ) {
				case 'ace':
					this.pad.getSession().setValue(value);
					break;

				case 'jquery':
					this.pad.val(value);
					break;

				case 'native':
					this.pad.value = value;
					break;
			}
		},

		/**
		 * Get Pad Selection Range
		 */
		getSelectionRange: function(value){
			var result;

			switch ( this.padType ) {
				case 'ace':
					var
						lines = this.pad.getSession().doc.getAllLines(), range = this.pad.getSelectionRange(),
						i,n1,n2,
						selectionStart=0,selectionEnd=0;

					for ( i=0,n1=lines.length,n2=range.end.row; i<n1 && i<=n2; ++i ) {
						// Selection Start
						if ( i === range.start.row ) {
							selectionStart += range.start.column;
						} else if ( i < range.start.row ) {
							selectionStart += lines[i].length+1;
						}

						// Selection End
						if ( i === range.end.row ) {
							selectionEnd += range.end.column;
						} else if ( i <= range.end.row ) {
							selectionEnd += lines[i].length+1;
						}
					}

					result = {
						selectionStart: selectionStart,
						selectionEnd: selectionEnd
					};
					console.log('get:',selectionStart,selectionEnd,[range.start.row,range.start.column],[range.end.row,range.end.column]);
					break;

				case 'jquery':
					var el = this.pad.get(0);
					result = {
						selectionStart: el.selectionStart,
						selectionEnd: el.selectionEnd
					};
					break;

				case 'native':
					result = {
						selectionStart: this.pad.selectionStart,
						selectionEnd: this.pad.selectionEnd
					};
					break;
			}

			return result;
		},

		/**
		 * Set Pad Selection Range
		 */
		setSelectionRange: function(selectionRange,value){
			switch ( this.padType ) {
				case 'ace':
					var
						session = this.pad.getSession();
					value = value||session.getValue();
					var
						startString = value.substring(0,selectionRange.selectionStart),
						endString = value.substring(0,selectionRange.selectionEnd),
						startSplit = startString.split('\n'),
						endSplit = endString.split('\n'),
						startRow = startSplit.length ? startSplit.length-1 : 0,
						endRow = endSplit.length ? endSplit.length-1 : 0,
						startColumn = startSplit[startRow].length,
						endColumn = endSplit[endRow].length;

					session.selection.setSelectionRange({
						start: {
							row: startRow,
							column: startColumn
						},
						end: {
							row: endRow,
							column: endColumn
						}
					});
					console.log('set:',selectionRange.selectionStart,selectionRange.selectionEnd,[startRow,startColumn],[endRow,endColumn]);
					break;

				case 'jquery':
					var el = this.pad.get(0);
					el.selectionStart = selectionRange.selectionStart;
					el.selectionEnd = selectionRange.selectionEnd;
					break;

				case 'native':
					this.pad.selectionStart = selectionRange.selectionStart;
					this.pad.selectionEnd = selectionRange.selectionEnd;
					break;
			}
		},

		/**
		 * Add a CSS Class to the Pad
		 */
		addClass: function(className){
			switch ( this.padType ) {
				case 'ace':
				case 'native':
					break;

				case 'jquery':
					this.pad.addClass(className);
					break;
			}
		},

		/**
		 * Remove a CSS Class from the Pad
		 */
		removeClass: function(className){
			switch ( this.padType ) {
				case 'ace':
				case 'native':
					break;

				case 'jquery':
					this.pad.removeClass(className);
					break;
			}
		}
	};

	// jQuery Bind
	jQuery.fn.nowpad = function(){
		var nowpad = new nowpadClient({
			pad: $(this)
		});
	};

})(window);
