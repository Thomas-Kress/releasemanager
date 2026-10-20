import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'

// Clerk sign-in is only available when a publishable key is configured
// (frontend/.env.local: VITE_CLERK_PUBLISHABLE_KEY=pk_...).
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

const app = <App clerkEnabled={Boolean(clerkKey)} />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {clerkKey ? <ClerkProvider publishableKey={clerkKey}>{app}</ClerkProvider> : app}
  </StrictMode>,
)
