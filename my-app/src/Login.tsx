import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button type = "button" onClick={handleLogin}>Login</button>

      <p style={{ marginTop: 20 }}>
        Don't have an account? <Link to="/signup">Create Account</Link>
      </p>
    </div>
  );
}

export default Login;