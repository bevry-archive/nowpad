(function(window,undefined){
	// Prepare
	var
		jQuery = window.jQuery, $ = jQuery,
		nowpadCommon = window.nowpadCommon;

	// Handle
	$(function(){
		var
			$doc = $('#doc'),
			doc = $doc.get(0),
			last = doc.value,
			patches = [],
			timer,
			timerReset = function(){
				if ( timer ) {
					clearTimeout(timer);
					timer = false;
				}
				timer = setTimeout(function(){
  				var patch = nowpadCommon.createPatch(last, doc.value);
  				if ( patch ) {
  					patches.push(patch);
  				}
  				if ( !patches.length ) {
  					return;
  				}
					window.now.sendPatch(patches,function(_result){
						if ( !_result ) {
							console.log('Waiting');
							timerReset();
						}
						else {
							patches = [];
						}
					});
				},500);
			};

    // Load
    window.now.loadPad = function(_value){
    	last = doc.value = _value;
    };

		// Init
    window.now.name = prompt("What's your name?", "");

		// Receive
		window.now.applyPatch = function(_name,_patches,_callback){
			// Apply
			if ( _name !== window.now.name ) {
				// Prepare
				var patch = nowpadCommon.createPatch(last, doc.value);
				if ( patch ) {
					patches.push(patch)
				}

				// Apply
				for ( var i=0,n=_patches.length; i<n; ++i ) {
					var result = nowpadCommon.applyPatch(_patches[i],doc.value,doc.selectionStart,doc.selectionEnd);
					doc.value = result.value;
					doc.selectionStart = result.a;
					doc.selectionEnd = result.z;
				}
			}

			// Update
			last = doc.value;
			timerReset();

			// Notify
			_callback();
		}

		// Send
		$doc.keyup(function(){
			timerReset();
		});
	});

})(window);
