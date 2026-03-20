import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 mt-auto">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-[family-name:var(--font-display)] text-2xl font-medium">
              Elevé
            </span>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Curated essentials for intentional living. Every piece is chosen
              for its craft, quality, and timeless appeal.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/shop" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Stationery
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Kitchen
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/contact" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <span className="text-sm text-foreground/70">
                  Shipping & Returns
                </span>
              </li>
              <li>
                <span className="text-sm text-foreground/70">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Stay in Touch
            </h4>
            <p className="text-sm text-foreground/70 mb-3">
              Get updates on new arrivals and exclusive offers.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // This is a placeholder — no actual subscription
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Elevé. All rights reserved. Demo store for testing purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
