import { ContactFormData, ShippingFormData } from './validation'

export function sanitizeContactData(contactData: ContactFormData) {
  return {
    name: contactData.name.trim().replace(/<[^>]*>/g, ''),
    email: contactData.email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, ''),
    phone: contactData.phone.trim().replace(/[^0-9+\-\s]/g, ''),
  }
}

export function sanitizeShippingData(shippingData: ShippingFormData) {
  return {
    street: shippingData.street.trim().replace(/<[^>]*>/g, ''),
    number: shippingData.number.trim().replace(/<[^>]*>/g, ''),
    city: shippingData.city.trim().replace(/<[^>]*>/g, ''),
    state: shippingData.state.trim(),
    postal_code: shippingData.postal_code.trim().replace(/<[^>]*>/g, ''),
    country: shippingData.country.trim(),
    notes: shippingData.notes.trim().replace(/<[^>]*>/g, ''),
  }
}
