# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-15

### Added

- Initial release
- **Pages:**
  - Home page with hero, categories, and featured products
  - Product catalog with client-side filters, search, and sorting
  - Product detail pages with gallery, reviews, and related products
  - Shopping cart page
  - Simulated checkout flow (no real payments)
  - Contact form page
  - About page with company history
  - Blog with articles
  - FAQ page with collapsible sections
  - Admin dashboard
  - Admin login page
  - Admin product management
  - Admin order management
  - Admin client management
  - Wishlist page
  - Terms and conditions page
- **Components:**
  - Sticky header with mega menu navigation
  - Complete footer
  - Hero section
  - Product cards with add-to-cart functionality
  - Product grid with loading skeleton
  - Cart drawer slide-out
  - Recently viewed products section
  - Newsletter subscription section
  - FAQ accordion sections
  - Testimonials section
  - Category showcase section
  - Cookie consent banner
  - Exit intent popup
  - Search modal
  - Toast notifications
  - Error boundary for error handling
  - Monstera background decorations
  - Leaf decorations
  - DevTools panel for development
  - Admin image upload component
- **Features:**
  - 60+ realistic dietetics products
  - Client-side filtering by category and tags
  - Persistent shopping cart with localStorage
  - Mock admin panel with metrics
  - Complete SEO with metadata and OpenGraph
  - Mobile-first responsive design
  - Dark mode support (via `dark` class on html)
  - Rate limiting utilities
  - CSRF protection utilities
  - GraphQL integration with types, queries, and adapters
  - Supabase integration (client and server)
  - GraphQL provider for data fetching
- **Data:**
  - 60+ mock products (nuts, seeds, flours, proteins, snacks)
  - Categories data
  - Testimonials data
  - Blog posts
  - Mock orders
  - FAQs
  - Site configuration
- **Technical:**
  - Next.js 14 with App Router
  - TypeScript with strict typing
  - Tailwind CSS utility-first styling
  - Zustand for global state management (cart)
  - Vercel deployment configuration
  - Sitemap and robots.txt generation
  - Web manifest for PWA support

### Changed

### Deprecated

### Removed

### Fixed

### Security

- CSRF token protection utilities
- Rate limiting implementation for API routes
