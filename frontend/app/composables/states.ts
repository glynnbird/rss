export const useColor = () => useState<string>('color', () => 'pink')
export const useArticleCount = () => useState<number>('count', () => 0 )
export const useAuth = () => useState<object>('auth', () => { return { authenticated: false, apiKey: '' } })
