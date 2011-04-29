(function(window,undefined){
	// Prepare
	var
		// Globals
		jQuery = window.jQuery, $ = jQuery,
		nowpadClient = window.nowpadClient,
		// Client
		Client = window.Client = {
			// Elements
			nowpad: null,

			// Initialise
			init: function(){
				// Prepare
				var me = this;

				// DomReady
				$(function(){
					// Nowpadify
					me.nowpad = new nowpadClient({
						pad: $('#pad')
					});
					// $('#pad').nowpad();
				});
			}
		};

	// Initialise
	Client.init();
})(window);
