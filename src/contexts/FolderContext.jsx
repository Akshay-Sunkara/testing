import { createContext, useContext, useState } from 'react'

const FolderContext = createContext(null)

export function FolderProvider({ children }) {
  const [folderHandle, setFolderHandle] = useState(null)
  const [folderName, setFolderName] = useState(null)

  const selectFolder = async () => {
    // Check if File System Access API is available
    if (!('showDirectoryPicker' in window)) {
      alert('File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.')
      return null
    }

    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite'
      })
      setFolderHandle(handle)
      setFolderName(handle.name)
      return handle
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting folder:', error)
        alert('Error selecting folder: ' + error.message)
      }
      return null
    }
  }

  const writeFileToFolder = async (content, filename = 'context.txt') => {
    if (!folderHandle) {
      // Fallback to regular download
      const blob = new Blob([content], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      return
    }

    try {
      const fileHandle = await folderHandle.getFileHandle(filename, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
      return true
    } catch (error) {
      console.error('Error writing file:', error)
      alert('Error writing file to folder: ' + error.message)
      // Fallback to regular download
      const blob = new Blob([content], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  return (
    <FolderContext.Provider value={{ folderHandle, folderName, selectFolder, writeFileToFolder }}>
      {children}
    </FolderContext.Provider>
  )
}

export function useFolder() {
  const context = useContext(FolderContext)
  if (!context) {
    throw new Error('useFolder must be used within FolderProvider')
  }
  return context
}

