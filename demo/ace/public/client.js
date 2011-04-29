(function(window,undefined){
	// Prepare
	var
		// Globals
		jQuery = window.jQuery, $ = jQuery,
		nowpadClient = window.nowpadClient,
		// Client
		Client = {
			// Vars
			editor: null,
			nowpad: null,

			// Initialise
			init: function(){
				// DomReady
				$(function(){
					// ACE
    			this.editor = ace.edit('pad');

					// Nowpad
					this.nowpad = new nowpadClient({
						pad: this.editor
					});
				});
			}
		};

	// Initialise
	Client.init();
})(window);
