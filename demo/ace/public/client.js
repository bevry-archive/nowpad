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
		createInstance('pad1a','doc1');
		createInstance('pad1b','doc1');
		createInstance('pad2','doc2');
	});


})(window);
