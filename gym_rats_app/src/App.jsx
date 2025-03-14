import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login' // Don't mind this error, app is working

import './App.css'

function App() {
  
  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
      
    </>
  )
}

export default App
