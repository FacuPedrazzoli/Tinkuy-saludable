'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface AdminDarkModeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
}

const AdminDarkModeContext = createContext<AdminDarkModeContextType | undefined>(undefined)

export function AdminDarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedMode = localStorage.getItem('adminDarkMode')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedMode === 'true' || (!savedMode && systemPrefersDark)) {
      setIsDarkMode(true)
    }
  }, [])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const newValue = !prev
      localStorage.setItem('adminDarkMode', String(newValue))
      return newValue
    })
  }, [])

  const setDarkMode = useCallback((value: boolean) => {
    setIsDarkMode(value)
    localStorage.setItem('adminDarkMode', String(value))
  }, [])

  return (
    <AdminDarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </AdminDarkModeContext.Provider>
  )
}

export function useAdminDarkMode() {
  const context = useContext(AdminDarkModeContext)
  if (!context) {
    throw new Error('useAdminDarkMode must be used within AdminDarkModeProvider')
  }
  return context
}