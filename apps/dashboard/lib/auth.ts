import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

const ENV_PASSWORD_HASH =
  process.env.DASHBOARD_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD_HASH ?? null

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
          const passwordHash = ENV_PASSWORD_HASH ?? organizer?.passwordHash
          const organizerId = organizer?.id ?? credentials.email
          const organizerName = organizer?.name ?? credentials.email
          const organizerEmail = organizer?.email ?? credentials.email
          if (!passwordHash) return null
          const valid = await verifyPassword(credentials.password, passwordHash)
          if (!valid) return null
          return { id: organizerId, name: organizerName, email: organizerEmail }
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
