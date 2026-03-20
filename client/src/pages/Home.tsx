/*
  DESIGN: "Elevated Essentials" — Modern Editorial Commerce
  - Magazine-style editorial layout
  - Playfair Display headings, Source Sans 3 body
  - Muted teal accent, crisp white base, deep charcoal text
  - Smooth entrance animations, parallax-like depth
*/

import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663316629236/FpX9Kus8sq2CqraQWoVtvR/hero-banner-RwoYYfyApQku8Xxnd7SoPz.webp";

export default function Home() {
  const featured = products.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section — Split layout */}
      <section className="relative overflow-hidden">
        <div className="container py-12 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-[70vh]">
            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:pr-16 order-2 lg:order-1"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
                Curated Essentials
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] mb-6">
                Objects Made
                <br />
                <span className="italic text-primary">with Intent</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md mb-8">
                A thoughtfully curated collection of everyday essentials — each
                chosen for its craft, quality, and timeless appeal.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop">
                  <Button size="lg" className="gap-2 px-8">
                    Shop Collection
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="px-8">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Image side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="relative order-1 lg:order-2"
            >
              <div className="relative rounded-sm overflow-hidden aspect-[16/10] lg:aspect-auto lg:h-[70vh]">
                <img
                  src={HERO_IMAGE}
                  alt="Curated lifestyle essentials on marble surface"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/20" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-2">
                The Edit
              </p>
              <h2 className="text-3xl lg:text-4xl">Featured Pieces</h2>
            </div>
            <Link href="/shop">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary">
                View All
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="py-16 bg-secondary/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">
                Ethically Sourced
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every material traced back to its origin. We partner with
                artisans who share our values.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">
                Free Shipping
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Complimentary shipping on all orders over $75. Carefully packed
                and shipped within 48 hours.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">
                Lifetime Guarantee
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built to last. If something doesn't hold up, we'll replace it —
                no questions asked.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl mb-4">Join the Community</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Create an account to save your favorites, track orders, and get
            early access to new collections.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Create Account
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
