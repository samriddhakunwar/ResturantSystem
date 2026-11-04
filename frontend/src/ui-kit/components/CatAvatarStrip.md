# CatAvatarStrip

A sideways-scrolling row of round cat avatars under the table header on the QR menu, listing the cats in the room today.

- Show only cats with `is_present_today`, each linking to `/cats/{slug}`.
- The avatars are 64px circles with a 2px `olive` ring. Inside, use a photo with `object-fit: cover`, or a silhouette as a placeholder.
- The section title uses the display face at `subheading` size. One script word ("purr") may sit beside it.
- If no cats are in today, hide the strip rather than showing an empty state.
