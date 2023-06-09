import './globals.css'
import { Inter } from 'next/font/google'
import { ContextProvider } from './context'
import Sidebar from './sidebar'
import AuthContext from './authcontext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Oslyn Tabs',
  description: 'Oslyn Tabs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <AuthContext>
          <ContextProvider>
            {children}
            <Sidebar />
          </ContextProvider>
        </AuthContext>
      </body>
    </html>
  )
}
