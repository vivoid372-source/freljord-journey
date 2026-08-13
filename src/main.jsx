import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './freljord-index.css'
import FreljordJourney from './FreljordJourney.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FreljordJourney standalone />
  </StrictMode>,
)
