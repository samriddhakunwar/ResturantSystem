// ─── Dashboard Analytics Mock Data ───────────────────────────────────────────
// Offline-demo figures in NPR.

export const statCards = [
  { id: 1, title: 'Total sales', value: 'Rs. 48,250', growth: '+12.5%', trend: 'up', icon: 'DollarSign' },
  { id: 2, title: 'Total orders', value: '142', growth: '+8.2%', trend: 'up', icon: 'ShoppingBag' },
  { id: 3, title: 'Pending orders', value: '3', growth: '-3.1%', trend: 'down', icon: 'Clock' },
  { id: 4, title: 'Avg order value', value: 'Rs. 340', growth: '+5.7%', trend: 'up', icon: 'TrendingUp' },
];

export const salesChartData = [
  { month: 'Jan', sales: 182000, orders: 520 },
  { month: 'Feb', sales: 196000, orders: 561 },
  { month: 'Mar', sales: 221000, orders: 640 },
  { month: 'Apr', sales: 208000, orders: 602 },
  { month: 'May', sales: 243000, orders: 702 },
  { month: 'Jun', sales: 251000, orders: 731 },
  { month: 'Jul', sales: 238000, orders: 690 },
  { month: 'Aug', sales: 262000, orders: 758 },
  { month: 'Sep', sales: 249000, orders: 720 },
  { month: 'Oct', sales: 284000, orders: 811 },
  { month: 'Nov', sales: 271000, orders: 790 },
  { month: 'Dec', sales: 298000, orders: 856 },
];

export const expensesChartData = [
  { month: 'Jan', ingredients: 52000, labor: 64000, utilities: 9000 },
  { month: 'Feb', ingredients: 55000, labor: 64000, utilities: 8500 },
  { month: 'Mar', ingredients: 61000, labor: 66000, utilities: 9200 },
  { month: 'Apr', ingredients: 58000, labor: 66000, utilities: 9000 },
  { month: 'May', ingredients: 67000, labor: 68000, utilities: 9800 },
  { month: 'Jun', ingredients: 70000, labor: 68000, utilities: 10200 },
  { month: 'Jul', ingredients: 66000, labor: 70000, utilities: 10500 },
  { month: 'Aug', ingredients: 72000, labor: 70000, utilities: 10800 },
  { month: 'Sep', ingredients: 69000, labor: 70000, utilities: 10100 },
  { month: 'Oct', ingredients: 78000, labor: 72000, utilities: 11000 },
  { month: 'Nov', ingredients: 75000, labor: 72000, utilities: 10600 },
  { month: 'Dec', ingredients: 82000, labor: 74000, utilities: 11800 },
];

export const recentOrders = [
  { id: 'ORD-001028', customer: 'Walk-in Customer', status: 'Served', amount: 'Rs. 1,240', time: '09:40 AM', table: 'Table 8' },
  { id: 'ORD-001027', customer: 'Guest', status: 'Pending', amount: 'Rs. 570', time: '09:31 AM', table: 'Table 3' },
  { id: 'ORD-001026', customer: 'Walk-in Customer', status: 'Ready', amount: 'Rs. 750', time: '09:24 AM', table: 'Table 6' },
  { id: 'ORD-001025', customer: 'Walk-in Customer', status: 'Preparing', amount: 'Rs. 420', time: '09:18 AM', table: 'Table 2' },
  { id: 'ORD-001024', customer: 'Aarav Sharma', status: 'Completed', amount: 'Rs. 940', time: '09:05 AM', table: 'Table 4' },
];

export const topItems = [
  { name: 'Catpuccino', sold: 124, revenue: 'Rs. 34,720' },
  { name: 'Purrfect Masala Chiya', sold: 210, revenue: 'Rs. 25,200' },
  { name: 'Whisker Waffles', sold: 61, revenue: 'Rs. 23,180' },
  { name: 'Chicken Momo Meow-dley', sold: 58, revenue: 'Rs. 20,880' },
  { name: 'Tuna Melt Paws', sold: 42, revenue: 'Rs. 18,900' },
];
