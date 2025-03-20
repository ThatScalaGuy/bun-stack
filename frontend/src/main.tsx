import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BackendProvider } from './context/BackendContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BackendProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </BackendProvider>
  </StrictMode>,
)
