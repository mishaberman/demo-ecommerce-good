/*
  DESIGN: "Elevated Essentials" — Shop Page
  - Editorial grid with category filters
  - Muted teal accent, Playfair Display headings
*/

import { useState } from "react";
import { products, getCategories } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

export default function Shop() {
  const categories = getCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 lg:py-16 border-b border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-2">
              The Collection
            </p>
            <h1 className="text-4xl lg:text-5xl mb-4">Shop All</h1>
            <p className="text-muted-foreground max-w-lg">
              Browse our complete range of curated essentials. Each piece is
              selected for quality, craftsmanship, and lasting appeal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="py-12 lg:py-16">
        <div className="container">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-sm border transition-colors ${
                activeCategory === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-sm border transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
