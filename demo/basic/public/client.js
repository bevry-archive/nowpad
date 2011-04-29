(function(window,undefined){
	// Prepare
	var
		// Globals
		jQuery = window.jQuery, $ = jQuery,
		// Client
		Client = {
			// Elements

			// Initialise
			init: function(){
				// DomReady
				$(function(){
					// Nowpadify
					$('#pad').nowpad();
				});
			}
		};

	// Initialise
	Client.init();
})(window);
