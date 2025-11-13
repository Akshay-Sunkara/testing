import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Fade in after mount
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleGetStarted = () => {
    setIsLeaving(true)
    // Wait for animation to complete before navigating
    setTimeout(() => {
      navigate('/app')
    }, 800)
  }

  return (
    <div className={`landing-page ${isLeaving ? 'leaving' : ''}`}>
      <div className={`landing-content ${isVisible ? 'visible' : ''}`}>
        <div className="hero-section">
          <h1 className="hero-title">
            The Context File
          </h1>
          <p className="hero-subtitle">
            Extract context from anywhere.<br />
            Slack, GitHub, websites, databases—all in one place.
          </p>
          
          <button className="cta-button" onClick={handleGetStarted}>
            <span className="button-text">Get Started</span>
            <div className="button-glow"></div>
            <svg className="button-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Animated background elements */}
        <div className="bg-decoration decoration-1"></div>
        <div className="bg-decoration decoration-2"></div>
        <div className="bg-decoration decoration-3"></div>
      </div>
    </div>
  )
}

export default LandingPage

