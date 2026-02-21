import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    dietaryRestrictions: "None",
    symptoms: "None",
    diagnoses: "None",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {

    const res = await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    console.log("Created user:", data);

    navigate("/");
  };

  return (
    <div className="overall-container" style={{ padding: 20 }}>
      <h2>Create Account</h2>

      <input name="firstName" placeholder="First Name" onChange={handleChange} />
      <br /><br />

      <input name="lastName" placeholder="Last Name" onChange={handleChange} />
      <br /><br />

      <input name="username" placeholder="Username" onChange={handleChange} />
      <br /><br />

      <input name="email" placeholder="Email" onChange={handleChange} />
      <br /><br />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <br /><br />

      <select name="dietaryRestrictions" onChange={handleChange}>
        <option>None</option>
        <option>Nut</option>
        <option>Gluten</option>
        <option>Vegetarian</option>
      </select>
      <br /><br />

      <select name="symptoms" onChange={handleChange}>
        <option value="">None</option>
        <option>Bloating</option>
        <option>Nausea</option>

      </select>
      <br /><br />

      <select name="diagnoses" onChange={handleChange}>
        <option value="">None</option>
        <option value="">Anemia</option>
        <option value="">something</option>
      </select>
      <br /><br />

      <button onClick={handleSubmit}>Create Account</button>
    </div>
  );
}

export default Signup;