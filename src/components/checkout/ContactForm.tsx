'use client'

import { ContactFormData } from '@/lib/checkout/validation'

interface ContactFormProps {
  contactData: ContactFormData
  setContactData: React.Dispatch<React.SetStateAction<ContactFormData>>
  errors: Record<string, string>
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  onSubmit: (e: React.FormEvent) => void
  nameInputRef: React.RefObject<HTMLInputElement>
  emailInputRef: React.RefObject<HTMLInputElement>
  phoneInputRef: React.RefObject<HTMLInputElement>
}

export default function ContactForm({
  contactData,
  setContactData,
  errors,
  setErrors,
  onSubmit,
  nameInputRef,
  emailInputRef,
  phoneInputRef,
}: ContactFormProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setContactData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl border border-neutral-100">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">
        Información de Contacto
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            ref={nameInputRef}
            value={contactData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
              errors.name ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
            }`}
            placeholder="Juan Pérez"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1" role="alert">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              ref={emailInputRef}
              value={contactData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
              }`}
              placeholder="juan@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1" role="alert">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              ref={phoneInputRef}
              value={contactData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                errors.phone ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
              }`}
              placeholder="+54 11 1234-5678"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1" role="alert">{errors.phone}</p>}
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="w-full mt-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
      >
        Continuar
      </button>
    </form>
  )
}
