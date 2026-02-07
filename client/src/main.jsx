import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen')
    if (loader) {
      loader.classList.add('hide')
      setTimeout(() => loader.remove(), 600)
    }
  }, 800)
})
