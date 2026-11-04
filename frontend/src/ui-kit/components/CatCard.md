# CatCard

One resident cat on the "Meet our cats" page: photo, name, facts, personality tags, adoption status and whether the cat is in the room today.

**What you provide**
- A `photo` with `alt="Momo curled up on a cushion"` and a 4:3 crop. Until real photos exist, use a cat silhouette from the **Cats** asset group with `alt=""`.
- `name` in the display face, a meta line written "2 yrs · girl · tabby", up to three personality chips, and `adoption_status`.
- `is_present_today` adds the "In the room today" dot line.

**Status badge** (top-left over the photo)
- "Looking for a home" (`wb-chip--new`) when `available`
- "Resident" (neutral) when the cat lives here
- "Adopted 🎉" is not used, because the system avoids emoji. Write "Adopted" with a neutral chip.

The whole card links to the cat's page. Grid: one column at 360px, two at 600px, three from 900px.
