/**
 * Security utilities for the application
 * Includes CSRF tokens, XSS prevention, and secure storage
 */

/**
 * Get CSRF token from header for API requests
 * This should be set by the backend on initial page load
 */
export const getCSRFToken = (): string | null => {
  const meta = document.querySelector('meta[name="csrf-token"]')
  return meta ? meta.getAttribute("content") : null
}

/**
 * Validate password strength
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePasswordStrength = (
  password: string,
): {
  isStrong: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isStrong: errors.length === 0,
    errors,
  }
}

/**
 * Sanitize user input to prevent XSS
 * Removes any script tags and dangerous attributes
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement("div")
  div.textContent = input
  return div.innerHTML
}

/**
 * Secure headers for API requests
 * Include CSRF token and other security headers
 */
export const getSecureHeaders = (): HeadersInit => {
  const csrfToken = getCSRFToken()
  return {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(csrfToken && { "X-CSRF-Token": csrfToken }),
  }
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-+$$$$]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Check if token is expired
 * Tokens are assumed to be JWT format
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
