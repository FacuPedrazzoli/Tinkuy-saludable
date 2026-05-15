import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SearchModal } from '@/components/SearchModal'

const mockProducts = [
  {
    id: '1',
    name: 'Almendras',
    slug: 'almendras',
    price: 1500,
    category: 'frutos-secos',
    images: ['/almendras.jpg'],
  },
  {
    id: '2',
    name: 'Nueces',
    slug: 'nueces',
    price: 1200,
    category: 'frutos-secos',
    images: ['/nueces.jpg'],
  },
]

vi.mock('@/lib/utils', () => ({
  formatPrice: vi.fn((price: number) => `$ ${price}`),
  cn: vi.fn((...args: any[]) => args.filter(Boolean).join(' ')),
}))

vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt }) => <img src={src} alt={alt} />),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('SearchModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('isOpen=true renderiza modal', () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('isOpen=false retorna null', () => {
    const { container } = render(<SearchModal isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('debounce de búsqueda espera 300ms', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: mockProducts }),
    })
    
    render(<SearchModal isOpen={true} onClose={vi.fn()} />)
    
    const input = screen.getByPlaceholderText('Buscar productos...')
    fireEvent.change(input, { target: { value: 'almendra' } })
    
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    
    expect(mockFetch).toHaveBeenCalled()
  })

  it('renderiza mensaje de sin resultados', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: [] }),
    })
    
    render(<SearchModal isOpen={true} onClose={vi.fn()} />)
    
    const input = screen.getByPlaceholderText('Buscar productos...')
    fireEvent.change(input, { target: { value: 'xyz123' } })
    
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    
    expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument()
  })

  it('renderiza resultados cuando hay productos', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: mockProducts }),
    })
    
    render(<SearchModal isOpen={true} onClose={vi.fn()} />)
    
    const input = screen.getByPlaceholderText('Buscar productos...')
    fireEvent.change(input, { target: { value: 'almendra' } })
    
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    
    expect(screen.getByText('Almendras')).toBeInTheDocument()
  })

  it('Escape cierra modal', () => {
    const onClose = vi.fn()
    render(<SearchModal isOpen={true} onClose={onClose} />)
    
    const input = screen.getByPlaceholderText('Buscar productos...')
    fireEvent.keyDown(input, { key: 'Escape' })
    
    expect(onClose).toHaveBeenCalled()
  })
})
