// ─── Dashboard Analytics Mock Data ───────────────────────────────────────────

export const statCards = [
  {
    id: 1,
    title: 'Total Sales',
    value: 'Rs 12,450',
    growth: '+12.5%',
    trend: 'up',
    icon: 'DollarSign',
    color: 'orange',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    id: 2,
    title: 'Total Orders',
    value: '356',
    growth: '+8.2%',
    trend: 'up',
    icon: 'ShoppingBag',
    color: 'blue',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    id: 3,
    title: 'Pending Orders',
    value: '12',
    growth: '-3.1%',
    trend: 'down',
    icon: 'Clock',
    color: 'yellow',
    bg: 'bg-yellow-50',
    iconColor: 'text-yellow-500',
  },
  {
    id: 4,
    title: 'Avg Order Value',
    value: 'Rs 34.90',
    growth: '+5.7%',
    trend: 'up',
    icon: 'TrendingUp',
    color: 'green',
    bg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
];

export const salesChartData = [
  { month: 'Jan', sales: 4200, orders: 120 },
  { month: 'Feb', sales: 5800, orders: 160 },
  { month: 'Mar', sales: 7200, orders: 210 },
  { month: 'Apr', sales: 6100, orders: 180 },
  { month: 'May', sales: 8900, orders: 255 },
  { month: 'Jun', sales: 9400, orders: 270 },
  { month: 'Jul', sales: 10200, orders: 295 },
  { month: 'Aug', sales: 11500, orders: 330 },
  { month: 'Sep', sales: 9800, orders: 280 },
  { month: 'Oct', sales: 12100, orders: 345 },
  { month: 'Nov', sales: 11200, orders: 320 },
  { month: 'Dec', sales: 12450, orders: 356 },
];

export const expensesChartData = [
  { month: 'Jan', ingredients: 1200, labor: 900, utilities: 350 },
  { month: 'Feb', ingredients: 1500, labor: 950, utilities: 320 },
  { month: 'Mar', ingredients: 1800, labor: 1000, utilities: 380 },
  { month: 'Apr', ingredients: 1600, labor: 980, utilities: 360 },
  { month: 'May', ingredients: 2100, labor: 1100, utilities: 400 },
  { month: 'Jun', ingredients: 2300, labor: 1150, utilities: 420 },
  { month: 'Jul', ingredients: 2500, labor: 1200, utilities: 450 },
  { month: 'Aug', ingredients: 2700, labor: 1250, utilities: 480 },
  { month: 'Sep', ingredients: 2400, labor: 1180, utilities: 430 },
  { month: 'Oct', ingredients: 2800, labor: 1300, utilities: 500 },
  { month: 'Nov', ingredients: 2600, labor: 1220, utilities: 460 },
  { month: 'Dec', ingredients: 2900, labor: 1350, utilities: 520 },
];

export const recentOrders = [
  { id: '#ORD-1024', customer: 'Aarav Sharma', status: 'Completed', amount: 'Rs 42.50', time: '2 min ago', table: 'Table 4' },
  { id: '#ORD-1023', customer: 'Priya Thapa', status: 'Preparing', amount: 'Rs 28.00', time: '5 min ago', table: 'Table 2' },
  { id: '#ORD-1022', customer: 'Rohan Khatri', status: 'Pending', amount: 'Rs 56.75', time: '8 min ago', table: 'Takeaway' },
  { id: '#ORD-1021', customer: 'Sneha Patel', status: 'Ready', amount: 'Rs 19.90', time: '12 min ago', table: 'Table 7' },
  { id: '#ORD-1020', customer: 'Vikram Singh', status: 'Completed', amount: 'Rs 63.20', time: '18 min ago', table: 'Table 1' },
  { id: '#ORD-1019', customer: 'Anita Rai', status: 'Completed', amount: 'Rs 34.50', time: '24 min ago', table: 'Table 3' },
  { id: '#ORD-1018', customer: 'Dev Maharjan', status: 'Preparing', amount: 'Rs 47.00', time: '30 min ago', table: 'Table 5' },
];

export const topItems = [
  { name: 'Margherita Pizza', sold: 124, revenue: 'Rs 1,860', img: '🍕' },
  { name: 'BBQ Chicken Pizza', sold: 98, revenue: 'Rs 1,470', img: '🍗' },
  { name: 'Veggie Supreme', sold: 87, revenue: 'Rs 1,131', img: '🥦' },
  { name: 'Garlic Bread', sold: 210, revenue: 'Rs 840', img: '🥖' },
  { name: 'Pepsi (Large)', sold: 189, revenue: 'Rs 567', img: '🥤' },
];
