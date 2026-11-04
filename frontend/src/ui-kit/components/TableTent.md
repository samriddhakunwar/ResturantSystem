# TableTent

The printed QR card for each table: café name, QR code, call to action and table number. Staff print these from Tables & QR.

- **Print layout:** A6 cards, four per A4 sheet, on a `@media print` page. Use a solid border in print and the dashed cut line on screen.
- **QR code:** at least 4 cm when printed, dark `charcoal` modules on a pure white square so it scans reliably, and a quiet zone of four modules or more.
- **QR target:** `{PUBLIC_BASE_URL}/t/{qr_token}`, where `PUBLIC_BASE_URL` is the café's LAN IP or domain and never `localhost`. The QR in the preview is a real code for a sample address.
- **Text:** "Scan for the menu," followed by the script word "meow!", then the table number in the display face, then a small Wi-Fi line from config.
- **Decoration:** one faint paw trail and one small cat. Keep them clear of the QR code.
