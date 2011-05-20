(->
	# Prepare
	$ = jQuery = window.jQuery
	console = window.console
	nowpadCommon = window.nowpadCommon
	List = nowpadCommon.List

	# Check Browser
	if $.browser.msie or typeof console is 'undefined' or typeof console.log is 'undefined'
		throw Error('Your browser is not supported yet')
	
	# Classes
	class Element
		# Requirements
		element: null
		elementType: null

		# Constructor
		constructor: (@element) ->
			# Determine type
			@elementType =
				if @element.getSession?
					'ace'
				else if @element instanceof jQuery
					'jquery'
				else if @element instanceof window.Element
					'native'
				else
					throw new Error 'Unknown element type'
		
		# Value
		value: (value) ->
			# Apply
			if value?
				switch @elementType
					when 'ace'
						@element.getSession().setValue value
					when 'jquery'
						@element.val value
					when 'native'
						@element.value = value
			# Fetch
			else
				switch @elementType
					when 'ace'
						@element.getSession().getValue()
					when 'jquery'
						@element.val()
					when 'native'
						@element.value
		
		# Selection Range
		selectionRange: (selectionRange,content) ->
			# Apply
			if selectionRange?
				switch @elementType
					when 'ace'
						# Calculate
						session = @element.getSession()
						content = content||session.getValue()
						startString = content.substring(0,selectionRange.selectionStart)
						endString = content.substring(0,selectionRange.selectionEnd)
						startSplit = startString.split('\n')
						endSplit = endString.split('\n')
						startRow = if startSplit.length then startSplit.length-1 else 0
						endRow = if endSplit.length then endSplit.length-1 else 0
						startColumn = startSplit[startRow].length
						endColumn = endSplit[endRow].length

						# Apply
						session.selection.setSelectionRange
							start:
								row: startRow
								column: startColumn
							end:
								row: endRow
								column: endColumn
					
					when 'jquery'
						element = @element.get 0
						element.selectionStart = selectionRange.selectionStart
						element.selectionEnd = selectionRange.selectionEnd
					
					when 'native'
						@element.selectionStart = selectionRange.selectionStart
						@element.selectionEnd = selectionRange.selectionEnd
			
			# Fetch
			else
				switch @elementType
					when 'ace'
						# Prepare
						lines = @element.getSession().doc.getAllLines()
						range = @element.getSelectionRange()
						selectionStart = 0
						selectionEnd = 0
						i = 0

						# Calculate
						while i < lines.length and i <= range.end.row
							# Selection Start
							if i is range.start.row
								selectionStart += range.start.column;
							else if i < range.start.row
								selectionStart += lines[i].length+1
							
							# Selection End
							if i is range.end.row
								selectionEnd += range.end.column;
							else if i <= range.end.row
								selectionEnd += lines[i].length+1;

							# Increment
							++i
						
						# Result
						result =
							selectionStart: selectionStart
							selectionEnd: selectionEnd
					
					when 'jquery'
						element = @element.get 0
						# Result
						result =
							selectionStart: el.selectionStart
							selectionEnd: el.selectionEnd

					when 'native'
						# Result
						result =
							selectionStart: @element.selectionStart
							selectionEnd: @element.selectionEnd
		
		# Select a line
		line: (line) ->
			if line
				switch @elementType
					when 'ace'
						@element.gotoLine line
		
		# Add CSS Class
		addClass: (name) ->
			switch @elementType
				when 'jquery'
					@element.addClass name
		
		# Remove CSS Class
		removeClass: (name) ->
			switch @elementType
				when 'jquery'
					@element.removeClass name
		
		# Change Event
		change: (callback) ->
			switch @elementType
				when 'ace'
					@element.getSession().on 'change', callback
				when 'jquery'
					@element.keyup callback
				when 'native'
					@element.addEventListener 'change', callback, false
	

	class Pad
		# Requirements
		id: null
		element: null
		documentId: null

		# Synchronisation
		lastSyncedValue: ''
		lastCurrentValue: ''
		lastSyncedState: false
		newSyncedState: false
		newSyncedStates: []
		selectionRange: 
			selectionStart: 0
			selectionEnd: 0
		
		# Misc
		timer: false
		timerDelay: 200
		isTyping: false
		inRequest: false
		timeoutDelay: 1500

		# Constructor
		constructor: ({@id,element,@documentId}) ->
			# Construct element
			@element = new Element element

			# Send off initial sync
			window.now.nowpad_valueSyncDocument @documentId, (state,value,delay) =>
				@lastCurrentValue = @lastSyncedValue = value
				@lastSyncedState = state
				@timerDelay = delay
				@element.value value
				window.setTimeout(
					=>
						@element.line 1
					500
				)
			
			# Bind to change event
			@element.change =>
				@resetTimer()

		# Sync notify
		syncNotify: (state) ->
			if state isnt @lastSyncedState
				@resetTimer()
		
		# Delay notify
		delayNotify: (delay) ->
			if delay isnt @timerDelay
				@timerDelay = delay

		# Timer Reset
		resetTimer: ->
			# Clear
			@clearTimer()
			@isTyping = true

			# Initialise
			@timer = window.setTimeout(
				=>
					@isTyping = false
					@request()
				@timerDelay
			)
		
		# Timer Clear
		clearTimer: ->
			if @timer
				window.clearTimeout @timer
				@timer = false
		
		# Request
		request: ->
			# Check
			unless nowpad.ready
				return false
			
			# Lock
			if @inRequest
				return false
			@inRequest = true

			# Update
			@sync()

			# Feedback
			@element.addClass 'sync'

			# Timeout function used before server requests
			timeoutCallback = =>
				# Unlock
				window.now.nowpad_unlockDocument @documentId

				# Feedback
				@element.removeClass 'sync'
				@inRequest = false
			
			# Grab a lock
			timeoutInterval = window.setTimeout timeoutCallback, @timeoutDelay
			window.now.nowpad_lockDocument @documentId, (lockSuccess) =>
				window.clearTimeout timeoutInterval

				# Success
				if lockSuccess
					# We got the lock

					# Update the current value
					@lastCurrentValue = @element.value()
					@selectionRange = @element.selectionRange()

					# Fetch our patch
					patch = nowpadCommon.createPatch @lastSyncedValue, @lastCurrentValue

					# Sync
					timeoutInterval = window.setTimeout timeoutCallback, @timeoutDelay
					window.now.nowpad_patchSyncDocument @documentId, @lastSyncedState, patch, (_states,_state) =>
						clearTimeout timeoutInterval

						# Log
						console.log 'Sync response: ', {_state,_states}

						# Updates?
						if _states.length isnt 0
							# Synchronise
							@newSyncedStates = _states
							@newSyncedState = _state

							# Apply the changes when the user has stopped typing
							if @isTyping
								@resetTimer()
							else
								@sync()
						
						# Unlock
						window.now.nowpad_unlockDocument @documentId

						# Feedback
						@element.removeClass 'sync'
						@inRequest = false
				
				# Failure
				else
					# We didn't get the lock

					# Feedback
					@element.removeClass 'sync'
					@inRequest = false

					# Try again later
					@resetTimer()
		
		# Synchronise the value between the client and server
		sync: ->
			# Check if there is something to do
			if @newSyncedStates.length is 0
				return false
			
			# Local Values
			lastCurrentValue = @lastCurrentValue
			newCurrentValue = @element.value()

			# Synced Values
			lastSyncedState = @lastSyncedState
			newSyncedStates = @newSyncedStates
			newSyncedState = @newSyncedState
			newSyncedValue = @lastSyncedValue

			# Range
			oldSelectionRange = #clone
				selectionStart: @selectionRange.selectionStart
				selectionEnd: @selectionRange.selectionEnd
			
			# Apply synced patches
			for state in newSyncedStates
				# Apply Patch
				console.log 'remote:', state
				newSyncedValue = @applyPatch state, newSyncedValue
			
			# Compare local changes
			if lastCurrentValue && (lastCurrentValue isnt newCurrentValue)
				# Generate and apply the patch to synced changes
				state =
					patch: nowpadCommon.createPatch lastCurrentValue||'', newCurrentValue
					clientId: nowpad.clientId
				console.log('local:', state);
				newCurrentValue = @applyPatch(state,newSyncedValue);
			else
				# Apply synced changes
				newCurrentValue = newSyncedValue
			
			# Has Changes?
			if @element.value() isnt newCurrentValue
				# Updated selection range
				newSelectionRange = @element.selectionRange()

				# Apply changes
				@element.value newCurrentValue

				# Determine newest selection change
				selectionStartDifference = (newSelectionRange.selectionStart-oldSelectionRange.selectionStart)
				selectionEndDifference = (newSelectionRange.selectionEnd-oldSelectionRange.selectionEnd)
				
				# Apply selection difference
				@selectionRange.selectionStart += selectionStartDifference
				@selectionRange.selectionEnd += selectionEndDifference

				# Log
				console.log(
					[newSelectionRange.selectionStart,oldSelectionRange.selectionStart],
					[newSelectionRange.selectionEnd,oldSelectionRange.selectionEnd],
					[selectionStartDifference,selectionEndDifference],
					[@selectionRange.selectionStart,@selectionRange.selectionEnd]
				)

				# Apply cursor
				console.log 'applying cursor:', @selectionRange
				@element.selectionRange @selectionRange, newCurrentValue
			
			# Apply ssync changes
			@newSyncedStates = []
			@newSyncedState = false
			@lastSyncedState = newSyncedState
			@lastSyncedValue = newSyncedValue
			@lastCurrentValue = newSyncedValue
		
		# Apply a patch to our state
		applyPatch: (_state,_value) ->
			# Sync Value
			patchResult = nowpadCommon.applyPatch(
				_state.patch
				_value
				@selectionRange
			)
			patchValue = patchResult.value

			# Sync and Apply Cursor
			if _value isnt patchValue and _state.clientId isnt nowpad.clientId
				# Log
				console.log 'updating cursor:',
					range: @selectionRange
					valuesDifferent: _value isnt patchValue
					clientDifferent: _state.clientId isnt nowpad.clientId
				# Apply
				@selectionRange = patchResult.selectionRange
			else
				# Log
				console.log 'ignored cursor:',
					range: @selectionRange
					valuesDifferent: _value isnt patchValue
					clientDifferent: _state.clientId isnt nowpad.clientId
			
			# Done
			return patchValue
		
	# NowPad
	nowpad = window.nowpad =
		# Variables
		ready: false
		clientId: null
		client:
			id: null
			info: {}
		pads: new List()
		pendingInstances: []

		# Initialise
		init: ->
			# Wait for now
			window.now.ready ->
				# Handshake
				window.now.nowpad_handshake(
					# Sync notify
					(documentId, state) ->
						console.log 'Sync notify called: ', documentId, state
						nowpad.pads.forEach (pad) ->
							if pad.documentId is documentId
								pad.syncNotify state
					# Delay notify
					(documentId, delay) ->
						nowpad.pads.forEach (pad) ->
							if pad.documentId is documentId
								pad.delayNotify delay
					# Callback
					(clientId) ->
						nowpad.clientId = clientId
						nowpad.ready = true
						for instance in nowpad.pendingInstances
							nowpad.createInstance instance.config, instance.callback
				)

		# Create Instance
		createInstance: (config,callback) ->
			if @ready
				padId = nowpad.pads.generateId()
				config.id = padId
				pad = new Pad(config)
				@pads.add(pad)
				if callback then callback(pad)
			else
				@pendingInstances.push {config,callback}
	
	# Initialise
	nowpad.init()
	
	# jQuery Extension
	jQuery.fn.nowpad = (documentId) ->
		$this = $(this)
		nowpad.createInstance(
			element: $this
			documentId: documentId || $this.data('documentId') || 'empty'
		)
		return $this

)()