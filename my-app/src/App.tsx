import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./NavBar.tsx";
import Home from "./Home.tsx";
import HealthInfo from "./HealthInfo.tsx";
import Recipe from "./Recipe.tsx";
import Profile from "./Profile.tsx";
import './App.css'

function App() {

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path = "/" element = {<Home />} />
        <Route path = "/HealthInfo" element = {<HealthInfo />} />
        <Route path = "/Recipe" element = {<Recipe />} />
        <Route path = "/Profile" element = {<Profile />} />
      </Routes>
    </Router>
  )
}

export default App
