import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { useAppStore } from './store/useAppStore'
import { applyDisplayPrefs } from './lib/display'
import './index.css'

// index.html applies the saved preferences before first paint; this keeps <html> in step with later changes.
applyDisplayPrefs(useAppStore.getState().display)
useAppStore.subscribe((state, previous) => {
  if (state.display !== previous.display) applyDisplayPrefs(state.display)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
