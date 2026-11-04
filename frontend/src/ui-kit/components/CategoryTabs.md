# CategoryTabs

Sticky menu-section tabs for the QR menu that scroll sideways on phones.

- Keep it `position: sticky; top: 0` under the table header.
- As the guest scrolls, the tab of the section in view gets `aria-selected="true"`; tapping a tab scrolls to its section.
- The selected tab is filled `olive-strong`; the others are `panel` with `olive-dark` text.
- Tabs are 40px tall pills, and the scrollbar is hidden.
- You provide the category names in display order (from `Category.display_order`). Keep each name to two or three words.
