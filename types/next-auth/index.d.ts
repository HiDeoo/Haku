import 'next-auth'

declare module 'next-auth' {
  interface User {
    email: string
  }

  export interface Session {
    user: {
      id: string
      email: string
    }
  }
}
