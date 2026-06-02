declare module 'klaro' {
  interface KlaroConfig {
    version?: number
    elementID?: string
    lang?: string
    acceptAll?: boolean
    hideDeclineAll?: boolean
    cookieName?: string
    cookieExpiresAfterDays?: number
    translations?: Record<string, unknown>
    services?: Array<Record<string, unknown>>
  }

  export function setup(config: KlaroConfig): void
  export function show(config?: KlaroConfig): void
}
