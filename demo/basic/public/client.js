(function(window,undefined){
	// Prepare
	var
		jQuery = window.jQuery, $ = jQuery,
		nowpad = window.nowpad;

	// DomReady
	$(function(){
		// Create Instance
		var createInstance = function(elementId,documentId){
			// ACE
			var editor = document.getElementById(elementId);

			// Nowpad
			nowpad.createInstance({
				element: editor,
				documentId: documentId
			});
		}

		// Create Pads
		createInstance('pad1','doc1');
	});


})(window);