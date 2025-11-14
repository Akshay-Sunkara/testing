import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFolder } from '../contexts/FolderContext'
import './LandingPage.css'

function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [showFolderSelection, setShowFolderSelection] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const navigate = useNavigate()
  const { selectFolder, folderName } = useFolder()

  useEffect(() => {
    // Fade in after mount
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleGetStarted = () => {
    setShowFolderSelection(true)
  }

  const handleSelectFolder = async () => {
    setIsSelecting(true)
    const handle = await selectFolder()
    setIsSelecting(false)
    
    if (handle) {
      // Wait a moment to show success, then navigate
      setTimeout(() => {
        setIsLeaving(true)
        setTimeout(() => {
          navigate('/app')
        }, 800)
      }, 500)
    }
  }

  return (
    <div className={`landing-page ${isLeaving ? 'leaving' : ''}`}>
      <div className={`landing-content ${isVisible ? 'visible' : ''} ${showFolderSelection ? 'folder-selection' : ''}`}>
        {!showFolderSelection ? (
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
        ) : (
          <div className="folder-selection-section">
            <h2 className="folder-question">
              Where is your vibe coding project located?
            </h2>
            <p className="folder-subtitle">
              Select the folder where you want to save your context file
            </p>
            
            {folderName && (
              <div className="selected-folder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{folderName}</span>
              </div>
            )}
            
            <button 
              className="folder-button" 
              onClick={handleSelectFolder}
              disabled={isSelecting}
            >
              {isSelecting ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Selecting...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{folderName ? 'Change Folder' : 'Open Folder'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Animated background elements */}
        <div className="bg-decoration decoration-1"></div>
        <div className="bg-decoration decoration-2"></div>
        <div className="bg-decoration decoration-3"></div>
      </div>
    </div>
  )
}

export default LandingPage

