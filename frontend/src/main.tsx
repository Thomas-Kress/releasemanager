import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'

// Clerk sign-in is only available when a publishable key is configured
// (frontend/.env.local: VITE_CLERK_PUBLISHABLE_KEY=pk_...).
// Switch in the root .env: VITE_CLERK_ACTIVE=true enables the sign-in (default: off).
const CLERK_ACTIVE = String(import.meta.env.VITE_CLERK_ACTIVE ?? 'false').trim().toLowerCase() === 'true'
const clerkKey = CLERK_ACTIVE ? (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) : undefined

const app = <App clerkEnabled={Boolean(clerkKey)} />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {clerkKey ? <ClerkProvider publishableKey={clerkKey}>{app}</ClerkProvider> : app}
  </StrictMode>,
)
