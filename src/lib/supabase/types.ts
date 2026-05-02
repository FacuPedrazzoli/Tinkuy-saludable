export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type user_role = 'owner' | 'admin' | 'editor'
export type order_status = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
export type payment_status = 'pending' | 'paid' | 'failed' | 'refunded'
export type payment_method = 'mercadopago' | 'transfer' | 'cash'
export type subscription_status = 'active' | 'unsubscribed' | 'bounced'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: user_role
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: user_role
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: user_role
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          total_orders: number
          total_spent: number
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          total_orders?: number
          total_spent?: number
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          total_orders?: number
          total_spent?: number
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          product_count: number
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          product_count?: number
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          product_count?: number
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price: number
          original_price: number | null
          category_id: string | null
          brand: string | null
          tags: string[]
          ingredients: string | null
          benefits: string[] | null
          nutritional_info: Json | null
          stock: number
          stock_alert: number
          rating: number
          reviews_count: number
          is_featured: boolean
          is_active: boolean
          is_organic: boolean
          is_gluten_free: boolean
          is_vegan: boolean
          is_keto: boolean
          weight_options: Json
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          price: number
          original_price?: number | null
          category_id?: string | null
          brand?: string | null
          tags?: string[]
          ingredients?: string | null
          benefits?: string[] | null
          nutritional_info?: Json | null
          stock?: number
          stock_alert?: number
          rating?: number
          reviews_count?: number
          is_featured?: boolean
          is_active?: boolean
          is_organic?: boolean
          is_gluten_free?: boolean
          is_vegan?: boolean
          is_keto?: boolean
          weight_options?: Json
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          price?: number
          original_price?: number | null
          category_id?: string | null
          brand?: string | null
          tags?: string[]
          ingredients?: string | null
          benefits?: string[] | null
          nutritional_info?: Json | null
          stock?: number
          stock_alert?: number
          rating?: number
          reviews_count?: number
          is_featured?: boolean
          is_active?: boolean
          is_organic?: boolean
          is_gluten_free?: boolean
          is_vegan?: boolean
          is_keto?: boolean
          weight_options?: Json
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          subtotal: number
          discount_amount: number
          shipping_cost: number
          total: number
          status: order_status
          payment_status: payment_status
          payment_method: payment_method | null
          payment_reference: string | null
          coupon_id: string | null
          notes: string | null
          shipping_address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          subtotal: number
          discount_amount?: number
          shipping_cost?: number
          total: number
          status?: order_status
          payment_status?: payment_status
          payment_method?: payment_method | null
          payment_reference?: string | null
          coupon_id?: string | null
          notes?: string | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          subtotal?: number
          discount_amount?: number
          shipping_cost?: number
          total?: number
          status?: order_status
          payment_status?: payment_status
          payment_method?: payment_method | null
          payment_reference?: string | null
          coupon_id?: string | null
          notes?: string | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          weight: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          weight?: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          weight?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: string
          discount_value: number
          min_purchase: number
          max_uses: number | null
          uses_count: number
          starts_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: string
          discount_value: number
          min_purchase?: number
          max_uses?: number | null
          uses_count?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          min_purchase?: number
          max_uses?: number | null
          uses_count?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_id: string | null
          customer_name: string
          rating: number
          title: string | null
          comment: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_id?: string | null
          customer_name: string
          rating: number
          title?: string | null
          comment?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_id?: string | null
          customer_name?: string
          rating?: number
          title?: string | null
          comment?: string | null
          is_approved?: boolean
          created_at?: string
        }
      }
      wishlist: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          full_name: string | null
          status: subscription_status
          subscribed_at: string
          unsubscribed_at: string | null
          source: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          status?: subscription_status
          subscribed_at?: string
          unsubscribed_at?: string | null
          source?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          status?: subscription_status
          subscribed_at?: string
          unsubscribed_at?: string | null
          source?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id: string
          value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
      }
      banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          image_url: string
          link: string | null
          link_text: string | null
          position: string
          sort_order: number
          is_active: boolean
          starts_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          image_url: string
          link?: string | null
          link_text?: string | null
          position?: string
          sort_order?: number
          is_active?: boolean
          starts_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          image_url?: string
          link?: string | null
          link_text?: string | null
          position?: string
          sort_order?: number
          is_active?: boolean
          starts_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          image_url: string | null
          category: string | null
          author_id: string | null
          author_name: string | null
          is_published: boolean
          published_at: string | null
          meta_title: string | null
          meta_description: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          image_url?: string | null
          category?: string | null
          author_id?: string | null
          author_name?: string | null
          is_published?: boolean
          published_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          image_url?: string | null
          category?: string | null
          author_id?: string | null
          author_name?: string | null
          is_published?: boolean
          published_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          customer_name: string
          customer_avatar: string | null
          rating: number
          comment: string
          product_id: string | null
          is_approved: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_avatar?: string | null
          rating: number
          comment: string
          product_id?: string | null
          is_approved?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_avatar?: string | null
          rating?: number
          comment?: string
          product_id?: string | null
          is_approved?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string | null
          message: string
          is_read: boolean
          read_at: string | null
          read_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject?: string | null
          message: string
          is_read?: boolean
          read_at?: string | null
          read_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string | null
          message?: string
          is_read?: boolean
          read_at?: string | null
          read_by?: string | null
          created_at?: string
        }
      }
      shipping_updates: {
        Row: {
          id: string
          order_id: string
          status: string
          description: string | null
          location: string | null
          estimated_delivery: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          description?: string | null
          location?: string | null
          estimated_delivery?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          description?: string | null
          location?: string | null
          estimated_delivery?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          amount: number
          payment_method: payment_method
          payment_reference: string | null
          status: payment_status
          mercadopago_id: string | null
          mercadopago_status: string | null
          mercadopago_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          amount: number
          payment_method: payment_method
          payment_reference?: string | null
          status?: payment_status
          mercadopago_id?: string | null
          mercadopago_status?: string | null
          mercadopago_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          payment_method?: payment_method
          payment_reference?: string | null
          status?: payment_status
          mercadopago_id?: string | null
          mercadopago_status?: string | null
          mercadopago_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type TableRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TableInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TableUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
