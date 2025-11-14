import { useState, useEffect } from 'react'
import './PromptBar.css'
import { API_BASE_URL } from '../config'
import { useFolder } from '../contexts/FolderContext'

function PromptBar() {
  const { writeFileToFolder } = useFolder()
  const [promptText, setPromptText] = useState('')
  const [isLoadingGithub, setIsLoadingGithub] = useState(false)
  const [isLoadingSlack, setIsLoadingSlack] = useState(false)
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(false)
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(false)
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false)
  const [showGithubModal, setShowGithubModal] = useState(false)
  const [showFirebaseModal, setShowFirebaseModal] = useState(false)
  const [showSupabaseModal, setShowSupabaseModal] = useState(false)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [githubData, setGithubData] = useState({
    token: '',
    username: '',
    repo: ''
  })
  const [githubUser, setGithubUser] = useState(null) // { username, user_id }
  const [githubRepos, setGithubRepos] = useState([])
  const [showRepoSelector, setShowRepoSelector] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [firebaseData, setFirebaseData] = useState({
    projectId: '',
    serviceAccountKey: ''
  })
  const [supabaseData, setSupabaseData] = useState({
    projectUrl: '',
    serviceRoleKey: ''
  })
  
  // Context accumulator
  const [contextItems, setContextItems] = useState([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  // Common documentation website suggestions
  const commonWebsites = [
    'platform.openai.com/docs',
    'docs.python.org/3/',
    'react.dev/learn',
    'nodejs.org/docs',
    'developer.mozilla.org/en-US/',
    'docs.github.com',
    'tailwindcss.com/docs',
    'nextjs.org/docs'
  ]

  useEffect(() => {
    // Check if we're returning from Slack OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const slackSuccess = urlParams.get('slack_success')
    const slackError = urlParams.get('slack_error')
    const errorMessage = urlParams.get('message')
    const sessionId = urlParams.get('session')
    const workspace = urlParams.get('workspace')
    const channels = urlParams.get('channels')
    const messages = urlParams.get('messages')
    
    if (slackSuccess === 'true' && sessionId) {
      handleSlackCallback(sessionId, workspace, channels, messages)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (slackError === 'true') {
      // Handle OAuth error
      alert(`❌ Slack OAuth Error: ${errorMessage || 'Unknown error occurred'}`)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // Close popup if this is one
      if (window.opener && !window.opener.closed) {
        window.close()
      }
    }

    // Listen for messages from OAuth popup window
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'slack_context') {
        const newItem = {
          id: Date.now(),
          type: 'Slack',
          name: event.data.name,
          content: event.data.content,
          timestamp: new Date().toISOString()
        }
        setContextItems(prev => [...prev, newItem])
      } else if (event.data && event.data.type === 'github_connected') {
        // Handle GitHub OAuth callback
        const user = {
          username: event.data.username,
          userId: event.data.userId
        }
        setGithubUser(user)
        // Load repositories
        fetch(`${API_BASE_URL}/api/github/repos?user_id=${user.userId}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
          .then(res => res.json())
          .then(data => {
            setGithubRepos(data.repos || [])
            setShowRepoSelector(true)
            setIsModalClosing(false)
          })
          .catch(err => {
            alert(`❌ Error loading repositories: ${err.message}`)
            console.error('GitHub repos error:', err)
          })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleSlackCallback = async (sessionId, workspace, channels, messages) => {
    setIsLoadingSlack(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/slack/context/${sessionId}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to retrieve Slack context')
      }

      const result = await response.json()
      const sessionData = result.data
      
      const contextName = `${workspace || 'Slack Workspace'} (${channels} channels, ${messages} messages)`
      
      // If this is a popup window (opened from OAuth), send data to parent and close
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: 'slack_context',
          name: contextName,
          content: sessionData.context_text
        }, window.location.origin)
        
        // Show brief success message before closing
        alert(`✅ Slack context extracted!\n\nThis window will close now.`)
        window.close()
      } else {
        // If this is the main window, add directly to context items
        const newItem = {
          id: Date.now(),
          type: 'Slack',
          name: contextName,
          content: sessionData.context_text,
          timestamp: new Date().toISOString()
        }
        
        setContextItems(prev => [...prev, newItem])
        
        // Show success message
        alert(`✅ Slack context extracted!\n\n${channels} channels\n${messages} messages`)
      }
      
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
      console.error('Slack extraction error:', error)
    } finally {
      setIsLoadingSlack(false)
    }
  }

  const handleExtractGithub = async () => {
    // If user is already authenticated, show repo selector
    if (githubUser) {
      await loadGitHubRepos(githubUser.userId)
      setShowRepoSelector(true)
    setIsModalClosing(false)
    } else {
      // Start OAuth flow
      window.open(`${API_BASE_URL}/api/github/install`, '_blank', 'width=600,height=700')
    }
  }

  const loadGitHubRepos = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/github/repos?user_id=${userId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to load repositories')
      }
      
      const data = await response.json()
      setGithubRepos(data.repos || [])
    } catch (error) {
      alert(`❌ Error loading repositories: ${error.message}`)
      console.error('GitHub repos error:', error)
    }
  }

  const handleCloseModal = () => {
    setIsModalClosing(true)
    setTimeout(() => {
      setShowGithubModal(false)
      setShowFirebaseModal(false)
      setShowSupabaseModal(false)
      setShowRepoSelector(false)
      setIsModalClosing(false)
    }, 250) // Match the animation duration
  }

  const handleExtractSlack = async () => {
    // Open Slack OAuth in a new tab
    window.open(`${API_BASE_URL}/api/slack/install`, '_blank')
  }

  const handleGithubSubmit = async () => {
    // OAuth flow - use selected repo
    if (githubUser && selectedRepo) {
      await extractGitHubRepo(selectedRepo)
      return
    }
    
    // Legacy PAT token flow
    if (!githubData.token || !githubData.username) {
      alert('Please provide at least a GitHub token and username')
      return
    }

    setIsLoadingGithub(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extract/github`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          token: githubData.token,
          username: githubData.username,
          repo: githubData.repo || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to extract context')
      }

      // Get the text content
      const text = await response.text()
      
      const displayName = githubData.repo 
        ? `${githubData.username}/${githubData.repo}`
        : `${githubData.username} (all repos)`
      
      // Add to context items
      const newItem = {
        id: Date.now(),
        type: 'GitHub',
        name: displayName,
        content: text,
        timestamp: new Date().toISOString()
      }
      
      setContextItems(prev => [...prev, newItem])
      
      handleCloseModal()
      setGithubData({ token: '', username: '', repo: '' })
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
      console.error('GitHub extraction error:', error)
    } finally {
      setIsLoadingGithub(false)
    }
  }

  const extractGitHubRepo = async (repo) => {
    if (!githubUser) return

    setIsLoadingGithub(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extract/github`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          user_id: githubUser.userId,
          username: githubUser.username,
          repo: repo.full_name || repo.name
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to extract context')
      }

      // Get the text content
      const text = await response.text()
      
      const displayName = repo.full_name || `${githubUser.username}/${repo.name}`
      
      // Add to context items
      const newItem = {
        id: Date.now(),
        type: 'GitHub',
        name: displayName,
        content: text,
        timestamp: new Date().toISOString()
      }
      
      setContextItems(prev => [...prev, newItem])
      
      setShowRepoSelector(false)
      setSelectedRepo(null)
      setIsModalClosing(false)
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
      console.error('GitHub extraction error:', error)
    } finally {
      setIsLoadingGithub(false)
    }
  }

  const handleGithubChange = (e) => {
    setGithubData({ ...githubData, [e.target.name]: e.target.value })
  }

  const handleWebsiteUrlChange = (e) => {
    const value = e.target.value
    setWebsiteUrl(value)
    setShowSuggestions(value.length > 0)
  }

  const handleSuggestionClick = (suggestion) => {
    setWebsiteUrl(suggestion)
    setShowSuggestions(false)
  }

  const handleExtractWebsite = async (e) => {
    e.preventDefault()
    
    if (!websiteUrl.trim()) {
      alert('Please enter a website URL')
      return
    }

    // Add https:// if not present
    let url = websiteUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    setIsLoadingWebsite(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extract/website`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to extract website content')
      }

      // Get the text content
      const text = await response.text()
      
      // Extract domain for display
      const domain = new URL(url).hostname.replace('www.', '')
      
      // Add to context items
      const newItem = {
        id: Date.now(),
        type: 'Website',
        name: domain,
        content: text,
        timestamp: new Date().toISOString()
      }
      
      setContextItems(prev => [...prev, newItem])
      
      setWebsiteUrl('')
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
      console.error('Website extraction error:', error)
    } finally {
      setIsLoadingWebsite(false)
    }
  }
  
  const handleExtractFirebase = () => {
    setShowFirebaseModal(true)
    setIsModalClosing(false)
  }

  const handleFirebaseChange = (e) => {
    setFirebaseData({ ...firebaseData, [e.target.name]: e.target.value })
  }

  const handleFirebaseSubmit = async () => {
    if (!firebaseData.projectId || !firebaseData.serviceAccountKey) {
      alert('Please provide Firebase Project ID and Service Account Key')
      return
    }

    setIsLoadingFirebase(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extract/firebase`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          projectId: firebaseData.projectId,
          serviceAccountKey: firebaseData.serviceAccountKey
        })
      })

      if (!response.ok) {
        const error = await response.json()
        const errorMsg = error.error || 'Failed to extract Firebase context'
        
        // Check if it's the Firestore API disabled error
        if (errorMsg.includes('Cloud Firestore API has not been used') || 
            errorMsg.includes('SERVICE_DISABLED') ||
            errorMsg.includes('firestore.googleapis.com')) {
          alert(`❌ Firestore API Not Enabled\n\n` +
                `Your Firebase project needs the Cloud Firestore API enabled.\n\n` +
                `To fix this:\n` +
                `1. Go to Firebase Console → Your Project\n` +
                `2. Click "Firestore Database" in the left menu\n` +
                `3. Click "Create database"\n` +
                `4. Choose any location and mode\n` +
                `5. Wait 2-3 minutes, then try again\n\n` +
                `Or click this link:\n` +
                `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${firebaseData.projectId}`)
        } else {
          alert(`❌ Error: ${errorMsg}`)
        }
        throw new Error(errorMsg)
      }

      // Get the text content
      const text = await response.text()
      
      // Add to context items
      const newItem = {
        id: Date.now(),
        type: 'Firebase',
        name: firebaseData.projectId,
        content: text,
        timestamp: new Date().toISOString()
      }
      
      setContextItems(prev => [...prev, newItem])
      
      handleCloseModal()
      setFirebaseData({ projectId: '', serviceAccountKey: '' })
    } catch (error) {
      console.error('Firebase extraction error:', error)
    } finally {
      setIsLoadingFirebase(false)
    }
  }

  const handleExtractSupabase = () => {
    setShowSupabaseModal(true)
    setIsModalClosing(false)
  }

  const handleSupabaseChange = (e) => {
    setSupabaseData({ ...supabaseData, [e.target.name]: e.target.value })
  }

  const handleSupabaseSubmit = async () => {
    if (!supabaseData.projectUrl || !supabaseData.serviceRoleKey) {
      alert('Please provide Supabase Project URL and Service Role Key')
      return
    }

    setIsLoadingSupabase(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extract/supabase`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          projectUrl: supabaseData.projectUrl,
          serviceRoleKey: supabaseData.serviceRoleKey
        })
      })

      if (!response.ok) {
        const error = await response.json()
        const errorMsg = error.error || 'Failed to extract Supabase context'
        alert(`❌ Error: ${errorMsg}`)
        throw new Error(errorMsg)
      }

      // Get the text content
      const text = await response.text()
      
      // Add to context items
      const newItem = {
        id: Date.now(),
        type: 'Supabase',
        name: new URL(supabaseData.projectUrl).hostname,
        content: text,
        timestamp: new Date().toISOString()
      }
      
      setContextItems(prev => [...prev, newItem])
      
      handleCloseModal()
      setSupabaseData({ projectUrl: '', serviceRoleKey: '' })
    } catch (error) {
      console.error('Supabase extraction error:', error)
    } finally {
      setIsLoadingSupabase(false)
    }
  }

  const handleDownloadAll = async () => {
    if (contextItems.length === 0) return
    
    // Trigger animation
    setIsDownloading(true)
    
    try {
      // Combine all context items into one file
      let combinedContent = '='.repeat(100) + '\n'
      combinedContent += '                    COMBINED CONTEXT FILE\n'
      combinedContent += '='.repeat(100) + '\n\n'
      combinedContent += `Generated: ${new Date().toISOString()}\n`
      combinedContent += `Total Items: ${contextItems.length}\n\n`
      
      contextItems.forEach((item, index) => {
        combinedContent += '\n' + '='.repeat(100) + '\n'
        combinedContent += `ITEM ${index + 1}: ${item.type} - ${item.name}\n`
        combinedContent += `Extracted: ${item.timestamp}\n`
        combinedContent += '='.repeat(100) + '\n\n'
        combinedContent += item.content
        combinedContent += '\n\n'
      })
      
      console.log('🔄 Filtering context with Gemini to extract programming-relevant information...')
      console.log(`📊 Original size: ${combinedContent.length} characters`)
      
      // Filter context through Gemini to extract only programming-relevant information
      const filterResponse = await fetch(`${API_BASE_URL}/api/filter-context`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ context: combinedContent })
      })
      
      if (!filterResponse.ok) {
        const error = await filterResponse.json()
        throw new Error(error.error || 'Failed to filter context')
      }
      
      const filterResult = await filterResponse.json()
      const filteredContent = filterResult.filteredContext
      const stats = filterResult.stats
      
      console.log('✅ Context filtered successfully!')
      console.log(`📉 Filtered size: ${stats.filtered_size} characters`)
      console.log(`📊 Reduction: ${stats.reduction_percent}%`)
      
      // Add header to filtered content
      let finalContent = '='.repeat(100) + '\n'
      finalContent += '          FILTERED CONTEXT FILE (Programming & Project Relevant)\n'
      finalContent += '='.repeat(100) + '\n\n'
      finalContent += `Generated: ${new Date().toISOString()}\n`
      finalContent += `Total Items Processed: ${contextItems.length}\n`
      finalContent += `Original Size: ${stats.original_size.toLocaleString()} characters\n`
      finalContent += `Filtered Size: ${stats.filtered_size.toLocaleString()} characters\n`
      finalContent += `Reduction: ${stats.reduction_percent}%\n`
      finalContent += `Filtered by: Gemini 2.5 Flash\n\n`
      finalContent += '='.repeat(100) + '\n\n'
      finalContent += filteredContent
      
      // Write to selected folder or fallback to download
      await writeFileToFolder(finalContent, 'context.txt')
      
      // Clear context items after animation
      setTimeout(() => {
        setContextItems([])
        setIsDownloading(false)
      }, 1000)
      
    } catch (error) {
      console.error('❌ Error filtering context:', error)
      alert(`❌ Error: ${error.message}\n\nFalling back to unfiltered download...`)
      
      // Fallback: download unfiltered content
      let combinedContent = '='.repeat(100) + '\n'
      combinedContent += '                    COMBINED CONTEXT FILE (UNFILTERED)\n'
      combinedContent += '='.repeat(100) + '\n\n'
      combinedContent += `Generated: ${new Date().toISOString()}\n`
      combinedContent += `Total Items: ${contextItems.length}\n`
      combinedContent += `Note: Filtering failed, this is raw unfiltered content\n\n`
      
      contextItems.forEach((item, index) => {
        combinedContent += '\n' + '='.repeat(100) + '\n'
        combinedContent += `ITEM ${index + 1}: ${item.type} - ${item.name}\n`
        combinedContent += `Extracted: ${item.timestamp}\n`
        combinedContent += '='.repeat(100) + '\n\n'
        combinedContent += item.content
        combinedContent += '\n\n'
      })
      
      await writeFileToFolder(combinedContent, 'context.txt')
      
      setTimeout(() => {
        setContextItems([])
        setIsDownloading(false)
      }, 1000)
    }
  }

  const handleEnhancePrompt = async () => {
    if (!promptText.trim()) {
      alert('Please enter an instruction first')
      return
    }

    if (contextItems.length === 0) {
      alert('Please add some context (GitHub, Slack, Website, or Database) before enhancing')
      return
    }

    setIsEnhancing(true)
    setIsAnimating(true)
    
    try {
      // Save original prompt
      const originalPrompt = promptText

      // Get list of available context types
      const contextTypes = contextItems.map(item => item.type)
      const uniqueContextTypes = [...new Set(contextTypes)]
      const contextSummary = uniqueContextTypes.join(', ')

      // Call backend API to enhance prompt (API key is secure on backend)
      const response = await fetch(`${API_BASE_URL}/api/enhance-prompt`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          prompt: originalPrompt,
          contextSummary: contextSummary
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to enhance prompt')
      }

      const data = await response.json()
      const enhancedText = data.enhancedPrompt

      setEnhancedPrompt(enhancedText)
      
      // Animate the transformation
      await animateTextTransformation(originalPrompt, enhancedText)
      
    } catch (error) {
      alert(`❌ Error enhancing prompt: ${error.message}`)
      console.error('Gemini API error:', error)
      setIsAnimating(false)
    } finally {
      setIsEnhancing(false)
    }
  }

  const animateTextTransformation = async (from, to) => {
    // First, fade out/shrink the original text
    const deleteSpeed = Math.max(5, Math.floor(from.length / 20)) // Faster deletion
    
    for (let i = from.length; i >= 0; i -= deleteSpeed) {
      setPromptText(from.substring(0, i))
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    setPromptText('')
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Then, type out the new text character by character
    const typeSpeed = 2 // Type 2 characters at a time for speed
    for (let i = 0; i <= to.length; i += typeSpeed) {
      setPromptText(to.substring(0, i))
      await new Promise(resolve => setTimeout(resolve, 15))
    }
    
    setPromptText(to)
    setIsAnimating(false)
  }

  const filteredSuggestions = commonWebsites.filter(site =>
    site.toLowerCase().includes(websiteUrl.toLowerCase())
  )

  return (
    <div className="prompt-container">
      <div className="prompt-bar">
        <div className="prompt-input-wrapper">
          <input
            type="text"
            placeholder="Enter your query or instruction here..."
            className={`prompt-input ${isAnimating ? 'animating' : ''}`}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && contextItems.length > 0) {
                e.preventDefault()
                handleEnhancePrompt()
              }
            }}
            disabled={isEnhancing}
          />
          
          <button 
            className={`send-icon-btn ${isEnhancing ? 'loading' : ''} ${!promptText || contextItems.length === 0 ? 'disabled' : ''}`}
            onClick={handleEnhancePrompt}
            disabled={isEnhancing || !promptText || contextItems.length === 0}
            title={contextItems.length === 0 ? 'Add context first to enhance your prompt' : 'Transform into hyperspecific prompt using Gemini 2.5 Flash'}
          >
            {isEnhancing ? (
              <span className="spinner-small"></span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
        
        <div className="button-group">
          <button 
            className={`action-btn github-btn ${isLoadingGithub ? 'loading' : ''}`}
            onClick={handleExtractGithub}
            disabled={isLoadingGithub}
          >
            {isLoadingGithub ? (
              <>
                <span className="spinner"></span>
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>Extract GitHub</span>
              </>
            )}
          </button>

          <button 
            className={`action-btn slack-btn ${isLoadingSlack ? 'loading' : ''}`}
            onClick={handleExtractSlack}
            disabled={isLoadingSlack}
          >
            {isLoadingSlack ? (
              <>
                <span className="spinner"></span>
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                </svg>
                <span>Extract Slack</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Website Documentation Extractor */}
      <div className="website-extractor">
        <div className="divider">
          <span>or extract from any website</span>
        </div>
        
        <form onSubmit={handleExtractWebsite} className="website-search-form">
          <div className="website-search-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Enter any website URL (e.g., openai.com/docs)"
              className="website-search-input"
              value={websiteUrl}
              onChange={handleWebsiteUrlChange}
              onFocus={() => setShowSuggestions(websiteUrl.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              disabled={isLoadingWebsite}
            />
            <button
              type="submit"
              className="website-search-btn"
              disabled={isLoadingWebsite || !websiteUrl.trim()}
            >
              {isLoadingWebsite ? (
                <span className="spinner-small"></span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Database Integrations Section */}
      <div className="database-integrations">
        <div className="divider">
          <span>or connect to your database</span>
        </div>
        
        <div className="database-buttons">
          <button 
            className={`database-btn firebase-btn ${isLoadingFirebase ? 'loading' : ''}`}
            onClick={handleExtractFirebase}
            disabled={isLoadingFirebase}
          >
            {isLoadingFirebase ? (
              <>
                <span className="spinner-small"></span>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="database-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5.821 3.823L12 1.5l6.179 2.323c.465.175.821.6.821 1.086v6.716c0 3.565-2.324 6.891-5.75 8.125L12 20.5l-1.25-.75C7.324 18.516 5 15.19 5 11.625V4.909c0-.486.356-.91.821-1.086z" stroke="#FFA000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 7v5M12 15h.01" stroke="#FFA000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="database-btn-content">
                  <span className="database-name">Firebase</span>
                  <span className="database-desc">Extract database structure & context</span>
                </div>
              </>
            )}
          </button>

          <button 
            className={`database-btn supabase-btn ${isLoadingSupabase ? 'loading' : ''}`}
            onClick={handleExtractSupabase}
            disabled={isLoadingSupabase}
          >
            {isLoadingSupabase ? (
              <>
                <span className="spinner-small"></span>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="database-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="#3ECF8E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="database-btn-content">
                  <span className="database-name">Supabase</span>
                  <span className="database-desc">Extract database structure & context</span>
                </div>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Download All Button */}
      {contextItems.length > 0 && (
        <div className="download-section">
          <button className={`download-all-btn ${isDownloading ? 'downloading' : ''}`} onClick={handleDownloadAll}>
            <div className="download-btn-content">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Download Context</span>
              <div className="context-count">{contextItems.length}</div>
              <svg 
                className="trash-icon" 
                width="25" 
                height="25" 
                viewBox="0 0 24 24" 
                fill="none"
                onClick={(e) => {
                  e.stopPropagation();
                  setContextItems([]);
                }}
              >
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* GitHub Repository Selector Modal - Dark Theme */}
      {showRepoSelector && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`} onClick={handleCloseModal}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '600px', 
              maxHeight: '80vh',
              backgroundColor: '#1a1a1a',
              border: '1px solid #2d2d2d',
              color: '#e0e0e0'
            }}
          >
            <div className="form-header" style={{ borderBottom: '1px solid #2d2d2d', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#e0e0e0' }}>
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <h3 style={{ margin: 0, color: '#e0e0e0', fontWeight: '600' }}>Select Repository</h3>
              </div>
              <button 
                className="close-btn" 
                onClick={handleCloseModal}
                style={{ color: '#999', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
              >
                ×
              </button>
            </div>
            
            {githubUser && (
              <p style={{ margin: '0 0 20px 0', color: '#999', fontSize: '13px', fontWeight: '400' }}>
                Connected as <strong style={{ color: '#667eea', fontWeight: '600' }}>{githubUser.username}</strong>
              </p>
            )}

            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto', 
              marginBottom: '20px',
              paddingRight: '4px'
            }}>
              {githubRepos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p style={{ margin: 0 }}>No repositories found</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {githubRepos.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      style={{
                        padding: '14px 16px',
                        border: `1px solid ${selectedRepo?.id === repo.id ? '#667eea' : '#2d2d2d'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedRepo?.id === repo.id ? '#1e1e2e' : '#1f1f1f',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedRepo?.id === repo.id ? '0 0 0 1px rgba(102, 126, 234, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedRepo?.id !== repo.id) {
                          e.currentTarget.style.borderColor = '#3d3d3d'
                          e.currentTarget.style.backgroundColor = '#252525'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedRepo?.id !== repo.id) {
                          e.currentTarget.style.borderColor = '#2d2d2d'
                          e.currentTarget.style.backgroundColor = '#1f1f1f'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <strong style={{ color: '#e0e0e0', fontSize: '15px', fontWeight: '600' }}>
                              {repo.full_name}
                            </strong>
                            {repo.private && (
                              <span style={{ 
                                fontSize: '10px', 
                                padding: '3px 8px', 
                                backgroundColor: '#3d2914', 
                                color: '#ff9800', 
                                borderRadius: '4px',
                                fontWeight: '600',
                                border: '1px solid #4d3a1f'
                              }}>
                                Private
                              </span>
                            )}
                          </div>
                          {repo.description && (
                            <p style={{ 
                              margin: '0 0 8px 0', 
                              fontSize: '13px', 
                              color: '#999', 
                              lineHeight: '1.5',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {repo.description}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#666', alignItems: 'center' }}>
                            {repo.language && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ 
                                  width: '10px', 
                                  height: '10px', 
                                  borderRadius: '50%', 
                                  backgroundColor: '#667eea',
                                  display: 'inline-block'
                                }}></span>
                                {repo.language}
                              </span>
                            )}
                            <span style={{ color: '#666' }}>
                              {new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        {selectedRepo?.id === repo.id && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#667eea',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#fff' }}>
                              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className={`generate-btn-full ${isLoadingGithub ? 'loading' : ''}`}
              onClick={() => selectedRepo && extractGitHubRepo(selectedRepo)}
              disabled={isLoadingGithub || !selectedRepo}
              style={{ 
                opacity: selectedRepo ? 1 : 0.4, 
                cursor: selectedRepo ? 'pointer' : 'not-allowed',
                backgroundColor: selectedRepo ? '#667eea' : '#2d2d2d',
                color: selectedRepo ? '#fff' : '#666',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (selectedRepo && !isLoadingGithub) {
                  e.currentTarget.style.backgroundColor = '#5568d3'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedRepo && !isLoadingGithub) {
                  e.currentTarget.style.backgroundColor = '#667eea'
                }
              }}
            >
              {isLoadingGithub ? (
                <>
                  <span className="spinner"></span>
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <span>Extract {selectedRepo ? selectedRepo.full_name.split('/')[1] : 'Repository'}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* GitHub Modal (Legacy PAT Token Flow) */}
      {showGithubModal && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`} onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>GitHub Information (Legacy)</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
              For OAuth login, click "Extract GitHub" button. This form is for Personal Access Token.
            </p>
            
            <div className="input-group">
              <label>GitHub Personal Access Token *</label>
              <input
                type="password"
                name="token"
                value={githubData.token}
                onChange={handleGithubChange}
                placeholder="ghp_xxxxxxxxxxxx"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Username or Organization *</label>
              <input
                type="text"
                name="username"
                value={githubData.username}
                onChange={handleGithubChange}
                placeholder="octocat"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Repository Name <span className="optional">(optional)</span></label>
              <input
                type="text"
                name="repo"
                value={githubData.repo}
                onChange={handleGithubChange}
                placeholder="Leave empty for all repositories"
                className="form-input"
              />
            </div>

            <button 
              className={`generate-btn-full ${isLoadingGithub ? 'loading' : ''}`}
              onClick={handleGithubSubmit}
              disabled={isLoadingGithub}
            >
              {isLoadingGithub ? (
                <>
                  <span className="spinner"></span>
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <span>Extract Context</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Firebase Modal */}
      {showFirebaseModal && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`} onClick={handleCloseModal}>
          <div className="modal-content firebase-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <div className="modal-title-with-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5.821 3.823L12 1.5l6.179 2.323c.465.175.821.6.821 1.086v6.716c0 3.565-2.324 6.891-5.75 8.125L12 20.5l-1.25-.75C7.324 18.516 5 15.19 5 11.625V4.909c0-.486.356-.91.821-1.086z" fill="#FFA000"/>
                  <path d="M12 7v5M12 15h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Firebase Configuration</h3>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <p className="modal-description">
              Connect your Firebase project to extract database structure, collections, security rules, and configuration context.
            </p>

            <div className="input-group">
              <label>Firebase Project ID *</label>
              <input
                type="text"
                name="projectId"
                value={firebaseData.projectId}
                onChange={handleFirebaseChange}
                placeholder="my-firebase-project"
                className="form-input"
              />
              <span className="helper-text">Found in Firebase Console → Project Settings</span>
            </div>

            <div className="input-group">
              <label>Service Account Key (JSON) *</label>
              <textarea
                name="serviceAccountKey"
                value={firebaseData.serviceAccountKey}
                onChange={handleFirebaseChange}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                className="form-input textarea-input"
                rows="6"
              />
              <span className="helper-text">Generate in Firebase Console → Project Settings → Service Accounts</span>
            </div>

            <button 
              className={`generate-btn-full firebase-submit-btn ${isLoadingFirebase ? 'loading' : ''}`}
              onClick={handleFirebaseSubmit}
              disabled={isLoadingFirebase}
            >
              {isLoadingFirebase ? (
                <>
                  <span className="spinner"></span>
                  <span>Extracting Context...</span>
                </>
              ) : (
                <>
                  <span>Extract Firebase Context</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Supabase Modal */}
      {showSupabaseModal && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`} onClick={handleCloseModal}>
          <div className="modal-content supabase-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <div className="modal-title-with-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="#3ECF8E"/>
                </svg>
                <h3>Supabase Configuration</h3>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <p className="modal-description">
              Connect your Supabase project to extract database schema, tables, columns, relationships, and RLS policies.
            </p>

            <div className="input-group">
              <label>Supabase Project URL *</label>
              <input
                type="text"
                name="projectUrl"
                value={supabaseData.projectUrl}
                onChange={handleSupabaseChange}
                placeholder="https://xxxxx.supabase.co"
                className="form-input"
              />
              <span className="helper-text">Found in Supabase Dashboard → Project Settings → API</span>
            </div>

            <div className="input-group">
              <label>Service Role Key *</label>
              <textarea
                name="serviceRoleKey"
                value={supabaseData.serviceRoleKey}
                onChange={handleSupabaseChange}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="form-input textarea-input"
                rows="4"
              />
              <span className="helper-text">Found in Supabase Dashboard → Project Settings → API → service_role key (keep secret!)</span>
            </div>

            <button 
              className={`generate-btn-full supabase-submit-btn ${isLoadingSupabase ? 'loading' : ''}`}
              onClick={handleSupabaseSubmit}
              disabled={isLoadingSupabase}
            >
              {isLoadingSupabase ? (
                <>
                  <span className="spinner"></span>
                  <span>Extracting Context...</span>
                </>
              ) : (
                <>
                  <span>Extract Supabase Context</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptBar

