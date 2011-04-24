(function(window,undefined){
	// Prepare
	var
		jQuery = window.jQuery, $ = jQuery,
		nowpadCommon = window.nowpadCommon;

	// Handle
	$(function(){
		var
			$stat = $('#stat'),
			state = $stat.get(0),
			$doc = $('#doc'),
			doc = $doc.get(0),
			lastValue = doc.value,
			patches = [],
			timer,
			timerClear = function(){
				if ( timer ) {
					clearTimeout(timer);
					timer = false;
				}
			},
			timerReset = function(){
				timerClear();
				timer = setTimeout(function(){
					// Check
					var
						newValue = doc.value,
						newHash = nowpadCommon.hash(newValue),
						patch = nowpadCommon.createPatch(lastValue, newValue),
						success = function(){
							lastValue = newValue;
							window.now.unlock();
						};

					// Get Lock
					if ( patch ) {
						stat.value = 'locking';
						window.now.lock(function(_result){
							// Success
							if ( (_result) ) {
								patch = nowpadCommon.createPatch(lastValue, newValue);
								stat.value = 'sending patch';
								window.now.sendPatch(patch,newHash,function(_result){
									if ( !_result ) {
										stat.value = 'sending value';
										window.now.sendValue(newValue,function(_result){
											stat.value = 'sent value';
											success();
										});
									}
									else {
										stat.value = 'sent patch';
										success();
									}
								});
							}
							// Error
							else {
								stat.value = 'waiting';
								timerReset();
							}
						});
					}
			},2000);
		};

    // Load
    window.now.loadPad = function(_value){
    	lastValue = doc.value = _value;
    };

		// Init
    window.now.name = prompt("What's your name?", "");

		// Receive
		window.now.applyPatch = function(_name,_patch,_hash,_callback){
			// Prepare
			timerClear();

			// Apply
			if ( false && _name !== window.now.name ) {
				stat.value = 'applying';
  			$doc.attr('readonly','readonly');

				// Prepare
				var
					newValue = doc.value,
					patch = nowpadCommon.createPatch(lastValue,newValue),
					result, success = function(){
						doc.value = lastValue = newValue;
  					$doc.attr('readonly','');
  				};


				// Apply
				result = nowpadCommon.applyPatch(_patch,newValue);
				newValue = result.value;

				// Check
				if ( nowpadCommon.hash(newValue) !== _hash ) {
					// Conflict
					window.now.fetchValue(function(_value){
						// Apply Recent Local Changes
						result = nowpadCommon.applyPatch(_patch,_value);
						newValue = result.value;

						// Patched
						success();
					});
				}
				else {
					// Patched
					success();
				}

				stat.value = 'applied';
			}

			// Notify
			_callback();
			timerReset();
		}

		// Send
		$doc.keyup(function(){
			timerReset();
		});
	});

})(window);
