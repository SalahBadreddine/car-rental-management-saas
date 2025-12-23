"use client"

import { useState } from "react"

interface FormError {
  field: string
  message: string
}

export const useAuthForm = () => {
  const [errors, setErrors] = useState<FormError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const clearErrors = () => setErrors([])
  const clearMessages = () => setSuccessMessage(null)

  const addError = (field: string, message: string) => {
    setErrors((prev) => [...prev, { field, message }])
  }

  const getFieldError = (field: string) => {
    return errors.find((e) => e.field === field)?.message || null
  }

  const hasError = (field: string) => !!getFieldError(field)

  return {
    errors,
    isLoading,
    successMessage,
    setIsLoading,
    setSuccessMessage,
    clearErrors,
    clearMessages,
    addError,
    getFieldError,
    hasError,
  }
}
