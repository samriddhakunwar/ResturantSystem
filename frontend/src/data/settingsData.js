// ─── Settings Mock Data ───────────────────────────────────────────────────────

export const defaultSettings = {
  restaurant: {
    name: 'Wow Pizza Hub',
    phone: '+977-01-4500123',
    address: 'Thamel, Kathmandu, Nepal 44600',
    email: 'info@wowpizzahub.com',
    taxRate: 13,
    currency: 'NPR',
    timezone: 'Asia/Kathmandu',
  },
  printer: {
    autoPrintKitchenTicket: true,
    autoPrintReceipt: false,
    soundNotification: true,
    printerName: 'Epson TM-T20III',
    paperSize: '80mm',
  },
  counter: {
    staffName: 'Raj Kumar Thapa',
    shift: 'Evening',
    counterNumber: 1,
    shiftStart: '04:00 PM',
    shiftEnd: '11:00 PM',
  },
  receipt: {
    thankYouMessage: 'Thank you for choosing Wow Pizza Hub! Come again soon 🍕',
    website: 'www.wowpizzahub.com',
    footerNote: 'All prices include applicable taxes.',
    showLogo: true,
    showQrCode: false,
  },
};
