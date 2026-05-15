'use client'

import { useState, useCallback } from 'react'
import { validateEmail } from '@/hooks/useValidation'

export interface ContactFormData {
  name: string
  email: string
  phone: string
}

export interface ShippingFormData {
  street: string
  number: string
  city: string
  state: string
  postal_code: string
  country: string
  notes: string
}

interface Refs {
  nameInputRef: React.RefObject<HTMLInputElement | null>
  emailInputRef: React.RefObject<HTMLInputElement | null>
  phoneInputRef: React.RefObject<HTMLInputElement | null>
  streetInputRef?: React.RefObject<HTMLInputElement | null>
  cityInputRef?: React.RefObject<HTMLInputElement | null>
  postalCodeInputRef?: React.RefObject<HTMLInputElement | null>
}

export function useCheckoutValidation(
  contactData: ContactFormData,
  shippingData: ShippingFormData,
  refs: Refs
) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateContact = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!contactData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (contactData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!contactData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!validateEmail(contactData.email)) {
      newErrors.email = 'Ingresá un email válido'
    }

    if (!contactData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (contactData.phone.replace(/\D/g, '').length < 8) {
      newErrors.phone = 'Ingresá un teléfono válido'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name && refs.nameInputRef.current) {
        refs.nameInputRef.current.focus()
      } else if (newErrors.email && refs.emailInputRef.current) {
        refs.emailInputRef.current.focus()
      } else if (newErrors.phone && refs.phoneInputRef.current) {
        refs.phoneInputRef.current.focus()
      }
      return false
    }
    return true
  }, [contactData, refs])

  const validateShipping = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    let firstErrorField: string | null = null

    if (!shippingData.street.trim()) {
      newErrors.street = 'La dirección es requerida'
      if (!firstErrorField) firstErrorField = 'street'
    }

    if (!shippingData.city.trim()) {
      newErrors.city = 'La ciudad es requerida'
      if (!firstErrorField) firstErrorField = 'city'
    }

    if (!shippingData.postal_code.trim()) {
      newErrors.postal_code = 'El código postal es requerido'
      if (!firstErrorField) firstErrorField = 'postal_code'
    }

    setErrors(newErrors)

    if (firstErrorField) {
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.focus()
      }
      return false
    }
    return true
  }, [shippingData])

  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  return {
    errors,
    validateContact,
    validateShipping,
    clearError,
    clearAllErrors,
    setErrors,
  }
}