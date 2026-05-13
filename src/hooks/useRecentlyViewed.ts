'use client'

import { useEffect } from 'react'
import { Product } from '@/types'
import { useRecentlyViewedStore } from '@/lib/store'

export function useRecentlyViewed(product: Product) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct)

  useEffect(() => {
    addProduct(product)
  }, [product, addProduct])
}