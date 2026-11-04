# SectionPanel

The kit's beige section card: a `panel` box with a centred display title. It groups one category or topic.

- Markup: `<section class="wb-panel">` with an `<h2 class="wb-panel-title">` inside.
- The title uses the `heading` style in `olive-dark`. The kit drew it in `olive`, but that is only 2.88:1 on panel.
- A cat silhouette may sit **on top of** a panel's edge, as the kit's charcoal walking cat does on "Buttons". Place it outside the panel with `position:absolute`, use at most one per screen, and give it `alt=""`.
- Use at most one doodle row and one script word (`wb-script`) per panel. Doodles never sit behind text.
- Panels stack with `space-6` between them and have `radius-lg` corners.
