(function(window,undefined){
	// Prepare
	var
		// Globals
		jQuery = window.jQuery, $ = jQuery,
		nowpad = window.nowpad,
		// Client
		Client = window.Client = {
			// Vars
			editor: null,
			nowpad: null,

			// Initialise
			init: function(){
				// Prepare
				var me = this;

				// DomReady
				$(function(){
					// ACE
    			me.editor = ace.edit('pad');
					me.editor.setShowPrintMargin(false);

					// Nowpad
					nowpad.createInstance({
						element: me.editor,
						documentId: 'single'
					});
				});
			}
		};

	// Initialise
	Client.init();
})(window);
