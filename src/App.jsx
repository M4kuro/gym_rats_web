import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/Login' // Don't mind this error, app is working
import Signup from './pages/Signup' 
import HomePage from './pages/HomePage'
import Navbar from "./components/Navbar.jsx";
import './App.css'
import ChallengeDetails from './pages/ChallengeDetails.jsx'

// adding a function to use for routes (where it hides navbar from certain pages..
// can add more pages later if needed.. )

function AppRoutes() {
  const location = useLocation();
  const hideNavbarOn = ["/", "/signup"]; // the pages where Navbar should be hidden

  return (
    <>
      {!hideNavbarOn.includes(location.pathname.toLowerCase()) && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/challenge/:id" element={<ChallengeDetails />} />
        {/* here is where you'd add more routes as needed */}
      </Routes>
    </>
  );
}


function App() {
  
  return (
    <>
      <Router>
      <AppRoutes />
    </Router>
      
    </>
  )
}

export default App
