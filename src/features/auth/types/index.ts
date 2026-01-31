export type LoginRequest = {
  id: string
  password: string
  keepLogin?: boolean
}

export type LoginResponse = {
  success: boolean
  message?: string
}

export type SignupRequest = {
  id: string
  password: string
}

export type SignupResponse = {
  success: boolean
  message?: string
}

export type DuplicateCheckResponse = {
  isDuplicated: boolean
}
