export const saveTokens = (access: string, refresh: string) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};

export const saveUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getAccessToken = () => localStorage.getItem("access_token");

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};