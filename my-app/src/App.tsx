import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./NavBar.tsx";
import Home from "./Home.tsx";
import HealthInfo from "./HealthInfo.tsx";
import Recipe from "./Recipe.tsx";
import Profile from "./Profile.tsx";
import Login from "./Login.tsx";
import Signup from "./Signup.tsx"
import './App.css'
import Chatbot from './chatbot'
import type { UserProfile } from './chatbot'

function App() {

  
  const currentUser: UserProfile | null = null

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path = "/" element = {<Home />} />
        <Route path = "/HealthInfo" element = {<HealthInfo />} />
        <Route path = "/Recipe" element = {<Recipe />} />
        <Route path = "/Profile" element = {<Profile />} />
        <Route path = "/Login" element = {<Login />} />
        <Route path = "/Signup" element = {<Signup />} />

      </Routes>
      <Chatbot user={currentUser} />
    </Router>
  )
}

export default App
