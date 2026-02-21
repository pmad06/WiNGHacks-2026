import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./NavBar.tsx";
import Home from "./Home.tsx";
import HealthInfo from "./HealthInfo.tsx";
import Recipe from "./Recipe.tsx";
import Profile from "./Profile.tsx";
import './App.css'
import Chatbot from './chatbot'
import type { UserProfile } from './chatbot'

function App() {

  // Replace with your real auth/user context when ready.
  // Pass null for logged-out users; Chatbot still works without profile data.
  const currentUser: UserProfile | null = null

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path = "/" element = {<Home />} />
        <Route path = "/HealthInfo" element = {<HealthInfo />} />
        <Route path = "/Recipe" element = {<Recipe />} />
        <Route path = "/Profile" element = {<Profile />} />
      </Routes>
      <Chatbot user={currentUser} />
    </Router>
  )
}

export default App
