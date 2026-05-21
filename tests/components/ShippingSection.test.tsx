import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ShippingSection } from '@/components/ShippingSection'

describe('ShippingSection', () => {
  it('renderiza la sección con su título accesible', () => {
    render(<ShippingSection />)
    expect(
      screen.getByRole('region', { name: /cómo enviamos tus pedidos/i })
    ).toBeInTheDocument()
  })

  it('informa que la compra se confirma luego de 24 hs para el despacho', () => {
    render(<ShippingSection />)
    expect(screen.getAllByText(/24\s?hs/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/despach/i)).toBeInTheDocument()
  })

  it('muestra envío gratis desde $20.000 en zona oeste cercana', () => {
    render(<ShippingSection />)
    expect(screen.getByText(/env[íi]o gratis/i)).toBeInTheDocument()
    expect(screen.getAllByText(/\$20\.000/).length).toBeGreaterThan(0)
  })

  it('lista las localidades cercanas con envío gratis', () => {
    render(<ShippingSection />)
    const localidades = [
      'Haedo',
      'Morón',
      'Villa Luzuriaga',
      'Villa Sarmiento',
      'Ramos Mejía',
      'El Palomar',
    ]
    for (const loc of localidades) {
      expect(screen.getByText(loc)).toBeInTheDocument()
    }
  })

  it('invita a consultar envíos a otras localidades de zona oeste', () => {
    render(<ShippingSection />)
    const region = screen.getByRole('region', { name: /cómo enviamos tus pedidos/i })
    expect(within(region).getByText(/consult[áa] env[íi]os/i)).toBeInTheDocument()
    expect(within(region).getAllByText(/zona oeste/i).length).toBeGreaterThan(0)
  })
})
