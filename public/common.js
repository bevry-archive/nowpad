(function(scope){
	// Check
	if ( typeof diff_match_path === 'undefined' && typeof require !== 'undefined' ) {
		diff_match_patch = require(__dirname+'/diff_match_patch.js').diff_match_patch;
	}

	// Prepare
	var dmp = new diff_match_patch();

	// Define
	scope.nowpadCommon = {
		wrapValue: function(value,a,z,A,Z){
			if ( z && a !== z && z !== value.length ) {
				value = value.substring(0,a)+A+value.substring(a,z)+Z+value.substring(z);
			}
			else {
				value = value.substring(0,a)+A+value.substring(a);
			}
			return value;
		},
		createPatch: function(a,b){
			var
  			patches = dmp.patch_make(a,b),
  			patchesStr = dmp.patch_toText(patches);
  		return patchesStr;
		},
		applyPatch: function(patchesStr,value,a,z) {
			// Prepare
			var
				patches = dmp.patch_fromText(patchesStr),
				l = z-a;

			// Encode
			if ( a || z ) {
				value.replace(/\{/g,'-{').replace(/\}/g,'}-');
				value = this.wrapValue(value,a,z,'{','}');
			}

			// Apply
			value = dmp.patch_apply(patches, value)[0];

			// Decode
			if ( a || z ) {
				// a1b{c}def
				// a1, c, def
				// a1, cdef

				// Split
				var values = value.split(/^\{|[^\-]\{|\}[^\-]|\}$/g);
				if ( values.length === 3 && !values[2] ) {
					values.pop();
				}

				// Detect
				var
					A = values[0].length+1,
					B = A+1,
					C = B+(values.length === 3 ? values[1].length : l),
					D = C+(values.length === 3 ? 1 : 0);

				// Update
				value = value.substring(0,A)+value.substring(B,C)+value.substring(D);
				a = B-1;
				z = C-1;
			}

			// Return
			return {
				value: value,
				a: a,
				z: z
			};
		}
	};

})(typeof exports === 'undefined' ? window : exports);
