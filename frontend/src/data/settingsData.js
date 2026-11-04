// ─── Settings Mock Data ───────────────────────────────────────────────────────

export const defaultSettings = {
  restaurant: {
    name: 'Whisker & Brew',
    phone: '+977-01-4500123',
    address: 'Jhamsikhel, Lalitpur, Nepal',
    email: 'hello@whiskerandbrew.example',
    taxRate: 13,
    serviceChargeRate: 10,
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
    staffName: 'Counter staff',
    shift: 'Day',
    counterNumber: 1,
    shiftStart: '09:00 AM',
    shiftEnd: '05:00 PM',
  },
  receipt: {
    thankYouMessage: 'Thank you for visiting Whisker & Brew. The cats hope to see you again.',
    website: '',
    footerNote: 'Totals include 10% service charge and 13% VAT.',
    showLogo: false,
    showQrCode: false,
  },
};
