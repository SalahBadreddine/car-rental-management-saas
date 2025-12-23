export const saveTokens = (access: string, refresh: string) => {
  localStorage.setItem("access_token", access)
  localStorage.setItem("refresh_token", refresh)
}

export const saveUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user))
}

export const getAccessToken = () => localStorage.getItem("access_token")

export const getUser = () => {
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export const getUserRole = () => {
  const user = getUser()
  // Get role from user object, fallback to localStorage for backward compatibility
  return user?.role || localStorage.getItem("user_role") || "enduser"
}

export const setUserRole = (role: "client" | "enduser") => {
  localStorage.setItem("user_role", role)
  const user = getUser()
  if (user) {
    localStorage.setItem("user", JSON.stringify({ ...user, role }))
  }
}

export const logout = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user")
  localStorage.removeItem("user_role")
  localStorage.removeItem("selectedLocation")
}
