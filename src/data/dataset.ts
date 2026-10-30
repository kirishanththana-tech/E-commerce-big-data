// Sample e-commerce dataset used consistently across all analytics pages.
// Fields: Order ID, Customer ID, Product ID, Product Name, Category, Quantity,
// Price, Order Date, Country, Payment Method.

export type Order = {
  orderId: string;
  customerId: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  orderDate: string; // ISO date
  country: string;
  paymentMethod: string;
};

export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Toys & Games',
  'Beauty & Health',
  'Sports & Outdoors',
] as const;

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Germany',
  'Canada',
  'Australia',
  'France',
  'India',
  'Japan',
  'Brazil',
  'South Africa',
] as const;

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Bank Transfer',
  'Cash on Delivery',
] as const;

const PRODUCTS: { id: string; name: string; category: string; price: number }[] = [
  { id: 'P001', name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 249.99 },
  { id: 'P002', name: '4K Action Camera', category: 'Electronics', price: 329.0 },
  { id: 'P003', name: 'Smart Fitness Watch', category: 'Electronics', price: 179.5 },
  { id: 'P004', name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 89.99 },
  { id: 'P005', name: 'USB-C Fast Charger 65W', category: 'Electronics', price: 39.99 },
  { id: 'P006', name: "Men's Classic Denim Jacket", category: 'Clothing', price: 79.99 },
  { id: 'P007', name: "Women's Running Shoes", category: 'Clothing', price: 119.0 },
  { id: 'P008', name: 'Cotton Crew T-Shirt', category: 'Clothing', price: 24.99 },
  { id: 'P009', name: 'Winter Knit Scarf', category: 'Clothing', price: 34.5 },
  { id: 'P010', name: 'Stainless Steel Cookware Set', category: 'Home & Kitchen', price: 189.0 },
  { id: 'P011', name: 'Espresso Coffee Machine', category: 'Home & Kitchen', price: 399.0 },
  { id: 'P012', name: 'Ceramic Dinner Plates (6pc)', category: 'Home & Kitchen', price: 59.99 },
  { id: 'P013', name: 'Robot Vacuum Cleaner', category: 'Home & Kitchen', price: 299.0 },
  { id: 'P014', name: 'The Data-Driven Business', category: 'Books', price: 29.99 },
  { id: 'P015', name: 'Modern Analytics Cookbook', category: 'Books', price: 44.5 },
  { id: 'P016', name: 'Building Thinking Systems', category: 'Books', price: 32.0 },
  { id: 'P017', name: 'Building Blocks Mega Set', category: 'Toys & Games', price: 69.99 },
  { id: 'P018', name: 'Remote Control Race Car', category: 'Toys & Games', price: 54.99 },
  { id: 'P019', name: 'Strategy Board Game', category: 'Toys & Games', price: 49.99 },
  { id: 'P020', name: 'Vitamin C Serum', category: 'Beauty & Health', price: 28.0 },
  { id: 'P021', name: 'Daily Multivitamin (90ct)', category: 'Beauty & Health', price: 22.5 },
  { id: 'P022', name: 'Scented Soy Candle', category: 'Beauty & Health', price: 19.99 },
  { id: 'P023', name: 'Yoga Mat Pro', category: 'Sports & Outdoors', price: 49.99 },
  { id: 'P024', name: 'Adjustable Dumbbell Set', category: 'Sports & Outdoors', price: 219.0 },
  { id: 'P025', name: 'Insulated Water Bottle 1L', category: 'Sports & Outdoors', price: 27.5 },
  { id: 'P026', name: 'Wireless Mechanical Keyboard', category: 'Electronics', price: 129.0 },
  { id: 'P027', name: 'Ergonomic Office Chair', category: 'Home & Kitchen', price: 329.0 },
  { id: 'P028', name: "Kids' Rain Boots", category: 'Clothing', price: 29.99 },
  { id: 'P029', name: 'Adventure Travel Backpack', category: 'Sports & Outdoors', price: 89.99 },
  { id: 'P030', name: 'Organic Green Tea (100 bags)', category: 'Beauty & Health', price: 18.5 },
];

// Deterministic pseudo-random generator (mulberry32) so the dataset is stable
// across reloads and never shows "random changing numbers".
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260130);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// Generate ~1,800 orders across 2025-01-01 .. 2025-12-29 with seasonal patterns.
function generateOrders(): Order[] {
  const orders: Order[] = [];
  const customerCount = 320;
  let orderSeq = 1;

  for (let day = 0; day < 365; day++) {
    // Seasonality: higher sales near holidays (Nov/Dec) and a mid-year peak.
    const month = (day / 30.5) | 0; // 0..11 approximate
    const seasonal = 1 + 0.5 * Math.sin((day / 365) * Math.PI * 2 - Math.PI / 2);
    const holidayBoost = month >= 10 ? 1.7 : month === 5 ? 1.3 : 1;
    const baseCount = 3 * seasonal * holidayBoost;
    const count = Math.max(1, Math.round(baseCount));

    for (let i = 0; i < count; i++) {
      const product = pick(PRODUCTS);
      const quantity = 1 + Math.floor(rand() * 4);
      const customerId = `C${(1 + Math.floor(rand() * customerCount)).toString().padStart(4, '0')}`;
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = (1 + (day % 28)).toString().padStart(2, '0');
      const date = `2025-${monthStr}-${dayStr}`;
      orders.push({
        orderId: `ORD-${orderSeq.toString().padStart(5, '0')}`,
        customerId,
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity,
        price: product.price,
        orderDate: date,
        country: pick(COUNTRIES),
        paymentMethod: pick(PAYMENT_METHODS),
      });
      orderSeq++;
    }
  }
  return orders;
}

export const ORDERS: Order[] = generateOrders();

export const PRODUCT_CATALOG = PRODUCTS;
