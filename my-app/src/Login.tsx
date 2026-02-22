import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
//import Home from "./Home.tsx";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
const handleLogin = async () => {
    console.log("login button clicker");
  const res = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    alert("Invalid username or password");
    return;
  }

  console.log("RESPONSE STATUS:", res.status);
  const user = await res.json();

  sessionStorage.setItem("user", JSON.stringify(user));
  console.log("Logged in user:", user);
  //take user to home (which we defined as /)
   navigate("/");
};
  return (
    <div className = "login-container">
      <h2>Login</h2>

      <input
        className = "login-input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />

      <input
        className = "login-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button id = "login-btn" type = "button" onClick={handleLogin}>Login</button>

      <div className = "p-links">
        <p id = "p1">Don't have an account?</p>
        <p id = "p2"><Link to="/signup">Create Account</Link></p>
      </div>
    </div>
  );
}

export default Login;