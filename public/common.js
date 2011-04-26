(function(scope){
	"use strict";

	// Check
	if ( typeof diff_match_path === 'undefined' && typeof require !== 'undefined' ) {
		diff_match_patch = require(__dirname+'/diff_match_patch.js').diff_match_patch;
	}

	// Prepare
	var dmp = new diff_match_patch();

	// Define
	scope.nowpadCommon = {
		createPatch: function(before,after){
			var
				patches = dmp.patch_make(before,after),
				patchesStr = dmp.patch_toText(patches);
			return patchesStr;
		},
		applyPatch: function(_patchesStr,_value,selectionStart,selectionEnd) {
			// Prepare
			var
				patches = dmp.patch_fromText(_patchesStr),
				result, pass = false,
				i, ii, patch, mod, diff, start,
				value;

			// Ensure
			selectionStart = selectionStart || 0;
			selectionEnd = selectionEnd || selectionStart || 0;

			// Apply
			result = dmp.patch_apply(patches,_value);
			value = result[0];
			pass = result[1][0]||false;

			// Decode
			if ( selectionStart || selectionEnd ) {

				// Cycle through patches
				for ( i=0; i<patches.length; ++i ) {
					// Fetch
					patch = patches[i];
					start = null;
					mod = 0;

					// Handle
					for ( ii=0; ii<patch.diffs.length; ++ii ) {
						diff = patch.diffs[ii];
						switch ( diff[0] ) {
							case -1:
								mod -= diff[1].length;
								break;
							case 0:
								if ( start === null ) {
									start = diff[1].length;
								}
								break;
							case 1:
								mod += diff[1].length;
								break;
						}
					}

					// Adjust
					if ( start === null ) {
						start = patch.start1;
					}
					else {
						start += patch.start1;
					}

					// Log
					// console.log(patch,selectionStart,selectionEnd,start,mod);

					// Apply
					if ( start < selectionStart ) {
						selectionStart += mod;
					}
					if ( start < selectionStart || start < selectionEnd ) {
						selectionEnd += mod;
					}
				}
			}

			// Return
			return {
				pass: pass,
				value: value,
				selectionStart: selectionStart,
				selectionEnd: selectionEnd
			};
		}
	};

})(typeof exports === 'undefined' ? window : exports);
