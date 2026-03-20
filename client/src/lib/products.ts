export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image: string;
  content_type: string;
  tags: string[];
}

export const products: Product[] = [
  {
    id: "prod_canvas_tote_001",
    name: "Heritage Canvas Tote",
    description: "Hand-finished canvas tote with vegetable-tanned leather handles. Spacious interior with an internal pocket for everyday essentials. Built to age beautifully over time.",
    price: 89.00,
    currency: "USD",
    category: "Bags",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663316629236/FpX9Kus8sq2CqraQWoVtvR/product-bag-T2Zr4p8M33JhyhL2KyXDaE.webp",
    content_type: "product",
    tags: ["canvas", "leather", "tote", "everyday"],
  },
  {
    id: "prod_sage_candle_002",
    name: "Sage & Cedar Candle",
    description: "Hand-poured soy wax candle in a matte ceramic vessel. Notes of white sage, cedarwood, and a hint of eucalyptus. Burns for approximately 55 hours.",
    price: 42.00,
    currency: "USD",
    category: "Home",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663316629236/FpX9Kus8sq2CqraQWoVtvR/product-candle-ejH7DRA9XdPU6DEYLcixGm.webp",
    content_type: "product",
    tags: ["candle", "soy", "ceramic", "home fragrance"],
  },
  {
    id: "prod_linen_journal_003",
    name: "Linen Bound Journal",
    description: "192 pages of premium 100gsm paper, bound in natural linen with a teal cover. Features a ribbon bookmark and elastic closure. Ideal for daily reflection or creative writing.",
    price: 34.00,
    currency: "USD",
    category: "Stationery",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663316629236/FpX9Kus8sq2CqraQWoVtvR/product-notebook-aVQYbHUeKtPmACTMQzPMJ7.webp",
    content_type: "product",
    tags: ["notebook", "linen", "stationery", "journal"],
  },
  {
    id: "prod_ceramic_mug_004",
    name: "Artisan Ceramic Mug",
    description: "Handcrafted speckled ceramic mug with an organic, slightly imperfect shape. Each piece is unique. Holds 12oz and is microwave and dishwasher safe.",
    price: 28.00,
    currency: "USD",
    category: "Kitchen",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663316629236/FpX9Kus8sq2CqraQWoVtvR/product-mug-4CAzzkwzfkuGw2uxgLemdo.webp",
    content_type: "product",
    tags: ["mug", "ceramic", "handcrafted", "kitchen"],
  },
  {
    id: "prod_wool_throw_005",
    name: "Merino Wool Throw",
    description: "Luxuriously soft merino wool throw blanket in a warm oatmeal tone. Lightweight yet warm, with a delicate herringbone weave and fringed edges.",
    price: 128.00,
    currency: "USD",
    category: "Home",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop",
    content_type: "product",
    tags: ["wool", "throw", "blanket", "home"],
  },
  {
    id: "prod_brass_pen_006",
    name: "Solid Brass Pen",
    description: "Machined from a single piece of solid brass, this pen develops a unique patina with use. Accepts standard international refills. Comes in a linen pouch.",
    price: 56.00,
    currency: "USD",
    category: "Stationery",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&h=750&fit=crop",
    content_type: "product",
    tags: ["pen", "brass", "stationery", "writing"],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getCategories(): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}
