'use client'

import { useEffect } from 'react'
import { Product } from '@/types'
import { useRecentlyViewedStore } from '@/lib/store'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'

interface ProductPageContentProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductPageContent({ product, relatedProducts }: ProductPageContentProps) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct)

  useEffect(() => {
    addProduct(product)
  }, [product, addProduct])

  return (
    <>
      <RecentlyViewed />
    </>
  )
}