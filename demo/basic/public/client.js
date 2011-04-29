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
					// Elements
					$textarea = $('#textarea').nowpad();
				});
			}
		};

	// Initialise
	Client.init();
})(window);
