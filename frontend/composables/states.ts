export const useColor = () => useState<string>('color', () => 'pink')
export const useAuth = () => useState<object>('auth', () => { return { authenticated: false, apiKey: '' } })
