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
  const role = localStorage.getItem("user_role")
  return role || "client" // Default to client
}

export const setUserRole = (role: "client" | "enduser") => {
  localStorage.setItem("user_role", role)
}

export const logout = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user")
  localStorage.removeItem("user_role")
}
