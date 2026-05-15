'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { siteConfig } from '@/data/siteConfig'
import { ToastContainer, useToast } from '@/components/Toast'

interface ContactForm {
  name: string
  email: string
  phone: string
  message: string
}

export default function ContactPage() {
  const router = useRouter()
  const toast = useToast()
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<ContactForm>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {}
    let firstErrorField: string | null = null

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es requerido'
      if (!firstErrorField) firstErrorField = 'name'
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
      if (!firstErrorField) firstErrorField = 'name'
    }

    if (!form.email.trim()) {
      newErrors.email = 'El email es requerido'
      if (!firstErrorField) firstErrorField = 'email'
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Ingresá un email válido'
      if (!firstErrorField) firstErrorField = 'email'
    }

    if (!form.message.trim()) {
      newErrors.message = 'El mensaje es requerido'
      if (!firstErrorField) firstErrorField = 'message'
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres'
      if (!firstErrorField) firstErrorField = 'message'
    }

    setErrors(newErrors)

    if (firstErrorField) {
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.focus()
      }
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (isSubmitting) return
    setIsSubmitting(true)

    const sanitizedForm = {
      name: form.name.trim().replace(/<[^>]*>/g, ''),
      email: form.email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, ''),
      phone: form.phone.trim().replace(/[^0-9+\-\s]/g, ''),
      message: form.message.trim().replace(/<[^>]*>/g, ''),
    }

    try {
      const contactUrl = (process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000').replace('/graphql', '/contact')
      const res = await fetch(contactUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedForm),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al enviar el mensaje')
      }

      setSubmitted(true)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar el mensaje')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof ContactForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 font-display mb-4">
            ¡Mensaje Enviado!
          </h1>
          <p className="text-neutral-600 mb-8">
            Gracias por contactarnos. Te responderemos a la brevedad.
          </p>
          <p className="text-sm text-neutral-500">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 font-display mb-4">
            Contactanos
          </h1>
          <p className="text-xl text-neutral-600">
            Estamos para ayudarte. Escribinos y te responderemos a la brevedad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-neutral-100">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Email</h3>
            <p className="text-neutral-600">{siteConfig.email}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-100">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Teléfono</h3>
            <p className="text-neutral-600">{siteConfig.phone}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-100">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Dirección</h3>
            <p className="text-neutral-600">{siteConfig.address}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-100">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">WhatsApp</h3>
            <p className="text-neutral-600">{siteConfig.phone}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-neutral-100">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                }`}
                placeholder="Tu nombre"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1" role="alert">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                }`}
                placeholder="tu@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1" role="alert">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
              Mensaje *
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none resize-none transition-colors ${
                errors.message ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
              }`}
              placeholder="¿En qué podemos ayudarte?"
            />
            {errors.message && <p className="text-red-500 text-sm mt-1" role="alert">{errors.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>
      </div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}