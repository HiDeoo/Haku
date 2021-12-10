declare module 'next-auth' {
  interface User {
    email: string
  }

  interface Session {
    user: {
      id: string
      email: string
    }
  }
}

export {}
