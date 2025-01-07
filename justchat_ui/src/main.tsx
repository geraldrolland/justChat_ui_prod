import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {BrowserRouter} from "react-router-dom"

export const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>
    </BrowserRouter>

  </StrictMode>,
)
