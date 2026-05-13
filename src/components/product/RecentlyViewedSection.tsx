'use client'

import { Product } from '@/types'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'

interface RecentlyViewedSectionProps {
  product: Product
}

export function RecentlyViewedSection({ product }: RecentlyViewedSectionProps) {
  useRecentlyViewed(product)

  return <RecentlyViewed />
}