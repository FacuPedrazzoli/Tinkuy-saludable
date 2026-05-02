# SUPABASE MIGRATION - TINKUY E-COMMERCE

## Overview

This document describes the complete Supabase integration for Tinkuy e-commerce platform.

## What Was Implemented

### 1. Database Schema (`supabase/schema.sql`)

20+ tables with full relationships, indexes, and Row Level Security (RLS):

- `users` - Admin users (extends Supabase Auth)
- `customers` - E-commerce customers
- `products` - Product catalog
- `categories` - Product categories
- `product_images` - Product image gallery
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records
- `shipping_updates` - Shipping tracking
- `coupons` - Discount codes
- `reviews` - Product reviews
- `wishlist` - Customer wishlists
- `banners` - Homepage banners
- `blog_posts` - Blog content
- `faqs` - FAQ entries
- `testimonials` - Customer testimonials
- `activity_logs` - Admin audit trail
- `contact_messages` - Contact form submissions
- `newsletter_subscribers` - Email list
- `settings` - Site configuration

### 2. Authentication

- Replaced basic password auth with Supabase Auth
- Email/password login for admins
- Role-based access (owner, admin, editor)
- Session management via cookies
- Activity logging

### 3. API Routes

- `POST /api/admin-auth` - Login with Supabase Auth
- `DELETE /api/admin-auth` - Logout
- `GET/POST /api/products` - List/Create products
- `GET/PUT/DELETE /api/products/[id]` - Product CRUD
- `GET/POST /api/categories` - Categories
- `GET/POST /api/orders` - List/Create orders
- `GET/PATCH /api/orders/[id]` - Order details/Status update
- `GET /api/customers` - Customer list
- `GET /api/admin/metrics` - Dashboard metrics

### 4. Admin Panel (Full CRUD)

- **Dashboard** - Real metrics from Supabase
- **Products** - Create, edit, delete products
- **Orders** - View and update order status
- **Customers** - View customer list

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy Project URL and anon/public key

### 2. Run Database Schema

1. Go to Supabase SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Execute SQL

### 3. Create Admin User

```sql
-- After schema is created, insert your admin user
INSERT INTO public.users (id, email, full_name, role)
VALUES ('your-supabase-user-id', 'admin@tinkuy.com', 'Admin', 'owner');
```

### 4. Configure Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Enable Row Level Security

RLS is already configured in the schema. Make sure to enable it for all tables in Supabase dashboard if not automatically enabled.

## Storage Setup

Create the following buckets in Supabase Storage:

1. `products` - Product images
2. `banners` - Homepage banners
3. `blog` - Blog post images
4. `avatars` - User avatars

Set public access policies for read access.

## Future Enhancements

- Email notifications via Resend
- MercadoPago integration for real payments
- Image upload from admin panel
- Real-time order updates via Supabase Realtime
- Full customer account management

## Troubleshooting

### Auth Issues

If login doesn't work:
1. Check RLS policies on `users` table
2. Verify Supabase URL and anon key are correct
3. Enable email confirmation in Supabase Auth settings

### Database Errors

If API routes fail:
1. Check table names match exactly (lowercase)
2. Verify foreign key references
3. Ensure RLS allows the operations

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- All admin operations require authentication
- RLS policies restrict data access appropriately
- Activity logs track all admin actions