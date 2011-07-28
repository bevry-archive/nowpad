(function(window,undefined){
	// Prepare
	var
		jQuery = window.jQuery, $ = jQuery,
		nowpad = window.nowpad,
		ace = window.ace;

	// DomReady
	$(function(){
		// Create Instance
		var createInstance = function(elementId,documentId,mode){
			// Prepare
			var editor;
			
			// Mode
			if ( mode === 'ace' ) {
				// ACE
				editor = ace.edit(elementId);
				editor.setShowPrintMargin(false);
			}
			else {
				// Textarea
				editor = document.getElementById(elementId);
			}

			// Nowpad
			nowpad.createInstance({
				element: editor,
				documentId: documentId
			});
		}

		// Create Pads
		createInstance('pad1a','doc1','ace');
		createInstance('pad1b','doc1','textarea');
		createInstance('pad2','doc2','ace');
	});

})(window);