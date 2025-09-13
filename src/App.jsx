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
import CreateChallenge from './Pages/CreateChallenge'
import Circles from './Pages/Circles'
import Activity from './Pages/Activity'
import Leaderboard from './Pages/Leaderboard';
import Feedback from './Pages/Feedback';

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
      <Route path ="/leaderboard" element ={<Leaderboard/>}/>
      <Route path="/challenges/create"
        element={
          <ProtectedRoute>
            <CreateChallenge />
          </ProtectedRoute>
        }
      />
      <Route path ="/community" element ={<Community/>}/>
      <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
<Route path='/circles' 
element={
  <ProtectedRoute>
    <Circles/>
  </ProtectedRoute>
}/>
<Route path='/activity' 
element={
  <ProtectedRoute>
    <Activity/>
  </ProtectedRoute>
}/>
<Route path='/feedback' 
element={
  <ProtectedRoute>
    <Feedback/>
  </ProtectedRoute>
}/>
    </Routes>
    </>
  )
}

export default App