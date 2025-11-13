import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PromptBar from './PromptBar'
import './MainApp.css'

function MainApp() {
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  return (
    <div className="main-app">
      <div className={`content ${isVisible ? 'visible' : ''}`}>
        <div className="header">
          <div className="title-with-back">
            <button className="close-button" onClick={() => navigate('/')} title="Back to home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="title">The Context File</h1>
          </div>
          <p className="subtitle">Get the context you need from Slack, GitHub, databases, and any API.</p>
        </div>
        <PromptBar />
      </div>
    </div>
  )
}

export default MainApp

