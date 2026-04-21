import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production-32ch',
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const organizer = await db.organizer.findUnique({ where: { email: credentials.email } })
          if (!organizer?.passwordHash) return null
          const valid = await compare(credentials.password, organizer.passwordHash)
          if (!valid) return null
          return { id: organizer.id, name: organizer.name, email: organizer.email }
        } catch (e) {
          console.error('[auth] authorize error:', e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
}
