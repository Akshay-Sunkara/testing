import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { FolderProvider } from './contexts/FolderContext'
import LandingPage from './components/LandingPage'
import MainApp from './components/MainApp'
import './App.css'

function App() {
  return (
    <FolderProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<MainApp />} />
        </Routes>
      </Router>
    </FolderProvider>
  )
}

export default App

