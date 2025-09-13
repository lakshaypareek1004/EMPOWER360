import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from './Components/Header'
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from './Pages/Contact'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Explore from './Pages/Explore'
import Community from './Pages/Community'
import Dashboard from './Pages/Dashboard'
import Challenges from './Pages/Challenges'

const App = () => {
  return (
    <>
    <Header/>
    <Routes>
      <Route path="/" element ={<Home/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path ="/explore" element ={<Explore/>}/>
      <Route path ="/contact" element ={<Contact/>}/>
      <Route path ="/login" element ={<Login/>}/>
      <Route path ="/signup" element ={<Signup/>}/>
      <Route path ="/challenges" element ={<Challenges/>}/>
      <Route path ="/community" element ={<Community/>}/>
      <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

    </Routes>
    </>
  )
}

export default App