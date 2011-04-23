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
			last = doc.value;

		// Init
    window.now.name = prompt("What's your name?", "");

		// Receive
		window.now.receiveMessage = function(name,patchesStr){
			// Apply
			if ( name !== window.now.name ) {
				var result = nowpadCommon.applyPatches(patchesStr,doc.value,doc.selectionStart,doc.selectionEnd);
				doc.value = result.value;
				doc.selectionStart = result.a;
				doc.selectionEnd = result.z;
			}

			// Update
			last = doc.value;
		}

		// Send
		var
			timer,
			timerReset = function(){
				if ( timer ) {
					clearTimeout(timer);
					timer = false;
				}
				timer = setTimeout(function(){
  				var patchesStr = nowpadCommon.generatePatches(last, doc.value);
					window.now.distributeMessage(patchesStr);
				},500);
			};
		$doc.keyup(function(){
			timerReset();
		});
	});

})(window);
