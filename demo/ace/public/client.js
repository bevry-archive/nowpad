(function(window,undefined){
	// Prepare
	var
		// Globals
		jQuery = window.jQuery, $ = jQuery,
		nowpadClient = window.nowpadClient,
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
					me.nowpad = new nowpadClient({
						pad: me.editor
					});
				});
			}
		};

	// Initialise
	Client.init();
})(window);
