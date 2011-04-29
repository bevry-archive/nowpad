(function(scope){
	"use strict";

	// Check
	if ( typeof diff_match_path === 'undefined' && typeof exports !== 'undefined' ) {
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
		applyPatch: function(_patchesStr,_value,_selectionRange) {
			// Prepare
			var
				patches = dmp.patch_fromText(_patchesStr),
				result, pass = false,
				i, ii, patch, mod, diff, start,
				value;

			// Ensure
			selectionRange = {};
			selectionRange.selectionStart = _selectionRange.selectionStart || 0;
			selectionRange.selectionEnd = _selectionRange.selectionEnd || _selectionRange.selectionStart || 0;

			// Apply
			result = dmp.patch_apply(patches,_value);
			value = result[0];
			pass = result[1][0]||false;

			// Decode
			if ( selectionRange.selectionStart || selectionRange.selectionEnd ) {

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
							case 1:
								mod += diff[1].length;
								break;
							default:
								break;
						}
					}

					// Adjust
					if ( patch.diffs[0][0] === 0 ) {
						start = patch.diffs[0][1].length;
					}
					start += patch.start1;

					// Log
					// console.log(patch,selectionStart,selectionEnd,start,mod);

					// Apply
					if ( start < selectionRange.selectionStart ) {
						selectionRange.selectionStart += mod;
					}
					if ( start < selectionRange.selectionStart || start < selectionRange.selectionEnd ) {
						selectionRange.selectionEnd += mod;
					}
				}
			}

			// Return
			return {
				pass: pass,
				value: value,
				selectionRange: selectionRange
			};
		}
	};

})(typeof exports === 'undefined' ? window : exports);
