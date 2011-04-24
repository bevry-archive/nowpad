(function(scope){
	// Check
	if ( typeof diff_match_path === 'undefined' && typeof require !== 'undefined' ) {
		diff_match_patch = require(__dirname+'/diff_match_patch.js').diff_match_patch;
	}

	// Prepare
	var dmp = new diff_match_patch();

	// Define
	scope.nowpadCommon = {
		createPatch: function(a,b){
			var
  			patches = dmp.patch_make(a,b),
  			patchesStr = dmp.patch_toText(patches);
  		return patchesStr;
		},
		applyPatch: function(_patchesStr,_value,a,z) {
			// Prepare
			var
				patches = dmp.patch_fromText(_patchesStr),
				result, pass = false,
				i, ii, patch, mod, diff, start;

			// Ensure
			a = a || 0;
			z = z || a || 0;

			// Apply
			result = dmp.patch_apply(patches,_value);
			value = result[0];
			pass = result[1][0]||false;

			// Decode
			if ( a || z ) {

				// Cycle through patches
				for ( i=0; i<patches.length; ++i ) {
					// Fetch
					patch = patches[i];
					start = patch.start1;

					// Handle
					for ( ii=0; ii<patch.diffs.length; ++ii ) {
						diff = patch.diffs[ii];
						if ( diff[0] !== 0 ) {
							break;
						}
						start += diff[1].length;
					}

					// Start
					mod = patch.length2 - patch.length1;

					console.log(patch,a,z,start,mod);

					// Adjust
					if ( start < a ) {
						a += mod;
					}
					if ( start < a || start < z ) {
						z += mod;
					}
				}
			}

			// Return
			return {
				pass: pass,
				value: value,
				a: a,
				z: z
			};
		}
	};

})(typeof exports === 'undefined' ? window : exports);
