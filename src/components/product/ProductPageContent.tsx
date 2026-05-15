'use client'

import { useEffect, useRef } from 'react'
import { Product } from '@/types'
import { useRecentlyViewedStore } from '@/lib/store'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'

interface ProductPageContentProps {
  product: Product
  relatedProducts?: Product[]
}

export function ProductPageContent({ product, relatedProducts = [] }: ProductPageContentProps) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct)
  const productRef = useRef(product)

  useEffect(() => {
    if (productRef.current.id !== product.id) {
      addProduct(product)
      productRef.current = product
    }
  }, [product, addProduct])

  return (
    <>
      <RecentlyViewed />
    </>
  )
}