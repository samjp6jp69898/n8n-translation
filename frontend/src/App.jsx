import React from 'react'
import { UploadPage } from './pages'
import './App.css'

/**
 * 主應用程式組件
 * 引入並顯示上傳頁面組件，提供整體應用程式的佈局和導航
 */
function App() {
  return (
    <div className="app-container bg-gray-50 min-h-screen">
      <UploadPage />
    </div>
  )
}

export default App
