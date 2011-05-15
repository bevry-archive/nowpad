(function(window,undefined){
	// Prepare
	var
		jQuery = window.jQuery, $ = jQuery,
		nowpad = window.nowpad,
		ace = window.ace;

	// DomReady
	$(function(){
		// Create Instance
		var createInstance = function(elementId,documentId){
			// ACE
			var editor = ace.edit(elementId);
			editor.setShowPrintMargin(false);

			// Nowpad
			nowpad.createInstance({
				element: editor,
				documentId: documentId
			});
		}

		// Create Pads
		createInstance('pad1','pad1');
		createInstance('pad2','pad1');
		createInstance('pad3','pad3');
	});


})(window);
