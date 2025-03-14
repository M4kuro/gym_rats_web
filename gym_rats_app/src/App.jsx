import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login' // Don't mind this error, app is working
import Signup from './pages/Signup' 

import './App.css'

function App() {
  
  return (
    <>
      <Router>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
      </Routes>
    </Router>
      
    </>
  )
}

export default App
