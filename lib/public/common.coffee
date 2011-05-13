(->
	# Scope
	scope = if window? then window else exports
	
	# Requirements
	diff_match_patch = if window? then window.diff_match_patch else require(__dirname+'/diff_match_patch.js').diff_match_patch

	# Prepare
	dmp = new diff_match_patch()

	# Define
	scope.nowpadCommon =
		
		# Create Patch
		createPatch: (before,after) ->
			patches = dmp.patch_make(before,after)
			patchesStr = dmp.patch_toText(patches)
			return patchesStr
		
		# Apply Patch
		applyPatch: (_patchesStr,_value,_selectionRange) ->
			# Prepare
			patches = dmp.patch_fromText(_patchesStr)
			pass = false
			selectionRange = {}

			# Ensure
			_selectionRange or= {}
			selectionRange.selectionStart = _selectionRange.selectionStart || 0
			selectionRange.selectionEnd = _selectionRange.selectionEnd || _selectionRange.selectionStart

			# Apply
			result = dmp.patch_apply(patches,_value)
			value = result[0]
			pass = result[1][0] || false

			# Decode
			if selectionRange.selectionStart or selectionRange.selectionEnd
				
				# Cycle through patches
				for patch in patches
					# Prepare
					start = null
					mod = 0

					# Handle
					for diff in patch.diffs
						switch diff[0]
							when -1
								mod -= diff[1].length
							when 1
								mod += diff[1].length
				
				# Adjust
				if patch.diffs[0][0] is 0
					start = patch.diffs[0][1].length
				start += patch.start1

				# Apply
				if start < selectionRange.selectionStart
					selectionRange.selectionStart += mod
				if start < selectionRange.selectionStart or start < selectionRange.selectionEnd
					selectionRange.selectionEnd += mod
			
			# Return
			return {
				pass: pass
				value: value
				selectionRange: selectionRange
			}
)()