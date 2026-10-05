import { createContext, useContext, useEffect, useMemo, useState } from 'react' // Hook React

const AuthContext = createContext(null) // Khởi tạo context

const STORAGE_KEY = 'mealmate_auth' // Key lưu trữ localStorage

const loadInitialState = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) // Lấy dữ liệu
    if (!raw) return { tokens: null, profile: null } // Không có token
    return JSON.parse(raw) // Parse JSON
  } catch {
    return { tokens: null, profile: null } // Lỗi parse
  }
}

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true) // Đang khởi tạo auth
  const [tokens, setTokens] = useState(() => loadInitialState().tokens) // State token
  const [profile, setProfile] = useState(() => loadInitialState().profile) // State profile

  useEffect(() => {
    setIsLoading(false) // Đã đọc xong localStorage, cho phép render
  }, []) // Chỉ chạy 1 lần khi mount

  const persist = (nextTokens, nextProfile) => {
    const payload = { tokens: nextTokens, profile: nextProfile } // Gói dữ liệu
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) // Ghi
  }

  const login = (tokenPayload, userInfo) => {
    setTokens(tokenPayload) // Cập nhật state token
    setProfile(userInfo ?? null) // Cập nhật profile
    persist(tokenPayload, userInfo ?? null) // Lưu localStorage
  }

  const logout = () => {
    setTokens(null) // Xoá token
    setProfile(null) // Xoá profile
    window.localStorage.removeItem(STORAGE_KEY) // Xoá storage
  }

  const value = useMemo(
    () => ({
      tokens,
      profile,
      isLoading,
      isAuthenticated: Boolean(tokens?.accessToken),
      login,
      logout,
      setProfile,
    }),
    [tokens, profile, isLoading],
  ) // Memo hoá context value

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider> // Provider
}

export const useAuth = () => {
  const ctx = useContext(AuthContext) // Lấy context
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider') // Chưa bọc provider
  }
  return ctx // Trả về context
}

