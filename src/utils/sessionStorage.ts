export function getSessionId(): string | null {
  return localStorage.getItem('sessionId')
}

export function setSessionId(sessionId: string): void {
  localStorage.setItem('sessionId', sessionId)
}

export function clearSessionId(): void {
  localStorage.removeItem('sessionId')
}

export function hasSessionId(): boolean {
  return getSessionId() !== null
}

// User id helpers
export function getUserId(): string | null {
  const raw = localStorage.getItem('userId')
  if (!raw || raw === 'undefined') return null
  return raw
}

export function setUserId(userId: string | null | undefined): void {
  if (!userId || userId === 'undefined') {
    localStorage.removeItem('userId')
    return
  }
  localStorage.setItem('userId', userId)
}

export function clearUserId(): void {
  localStorage.removeItem('userId')
}

export function hasUserId(): boolean {
  return getUserId() !== null
}

// Username helpers
export function getUsername(): string | null {
  const raw = localStorage.getItem('username')
  if (!raw || raw === 'undefined') return null
  return raw
}

export function setUsername(username: string | null | undefined): void {
  if (!username || username === 'undefined') {
    localStorage.removeItem('username')
    return
  }
  localStorage.setItem('username', username)
}

export function clearUsername(): void {
  localStorage.removeItem('username')
}

