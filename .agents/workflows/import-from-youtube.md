# /import-from-youtube

Trigger the `extract-from-youtube` skill.

Ask the user for the video URL (or transcript, if fetching isn't available).
Extract every model mentioned, cross-check against primary sources where
possible, present the draft list for confirmation, then hand each confirmed
model to `add-model-entry` one at a time.

Do not write any files until the user has confirmed the draft list.
