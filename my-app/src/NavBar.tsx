import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./NavBar.css";

function NavBar(){
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState("home");

    const handleHomeClick = () => {
        navigate("/");
        setCurrentPage("home");
    }
    const handleHealthInfoClick = () => {
        navigate("/HealthInfo");   
        setCurrentPage("health");
    }
    const handleRecipeClick = () => {
        navigate("/Recipe");
        setCurrentPage("recipe");
    }
    const handleProfileClick = () => {
        navigate("/Profile");
        setCurrentPage("profile");
    }
    const handleLoginClick = () => {
        navigate("/Login");
        setCurrentPage("login");
    }

    return(
        <div className = "nav-container">
            <button 
                className = {
                    (currentPage === "home" ? "active" : "inactive")
                }
                onClick = {handleHomeClick}>Home
            </button>
            <button 
                className = {
                    (currentPage === "health" ? "active" : "inactive")
                } 
                onClick = {handleHealthInfoClick}>HealthInfo
            </button>
            <button 
                className = { 
                    (currentPage === "recipe" ? "active" : "inactive")
                }
                onClick = {handleRecipeClick}>Recipe
            </button>
            
            <div className = "right-side">
                <button 
                    className = {
                        (currentPage === "profile" ? "active" : "inactive")
                    }
                    onClick = {handleProfileClick}>Profile
                </button>
                <button 
                    className = {
                        (currentPage === "login" ? "active" : "inactive")
                    }
                    onClick = {handleLoginClick}>Login
                </button>
            </div>
        </div>
    );
}

export default NavBar;