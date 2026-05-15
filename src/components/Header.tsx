'use client'

import { useState, useEffect } from 'react'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { SearchModal } from './SearchModal'
import { Logo } from './Header/Logo'
import { Navigation } from './Header/Navigation'
import { SearchButton } from './Header/SearchButton'
import { WishlistButton } from './Header/WishlistButton'
import { CartButton } from './Header/CartButton'
import { MobileMenuButton } from './Header/MobileMenuButton'
import { MobileMenu } from './Header/MobileMenu'
import { BottomNav } from './BottomNav'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const items = useCartStore((state) => state.items)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = useWishlistStore((state) => state.items.length)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          isScrolled
            ? 'bg-white/98 backdrop-blur-md shadow-card border-neutral-100'
            : 'bg-white border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Logo />

            <Navigation
              isCategoryOpen={isCategoryOpen}
              onCategoryOpenChange={setIsCategoryOpen}
            />

            <div className="flex items-center space-x-2 sm:space-x-4">
              <SearchButton onClick={() => setIsSearchOpen(true)} />

              <WishlistButton wishlistCount={wishlistCount} />

              <CartButton itemCount={itemCount} onClick={toggleCart} />

              <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <BottomNav onSearchClick={() => setIsSearchOpen(true)} />
    </>
  )
}