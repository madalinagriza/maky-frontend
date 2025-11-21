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

