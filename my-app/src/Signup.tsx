import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [diagnoses, setDiagnoses] = useState<string[]>([]);

  //i couldnt tell if we had confirmed options so i just put placeholders for now 
const dietaryOptions = [
  "None",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  ];

const symptomOptions = [
  "Nausea",
  "Bloating",
];

const diagnosisOptions = [
  "Celiac",
  "Anemia",
];
 const handleMultiSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setter(selected);
  };

  
  const handleSignup = async () => {
    const res = await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        username,
        email,
        password,
        dietaryRestrictions,
        symptoms,
        diagnoses,
      }),
    });

    if (!res.ok) {
      alert("Signup failed");
      return;
    }

    alert("Account created!");
  };

  return (
    <div className="overall-container" >
      <h2>Create Account</h2>

       <input placeholder="First Name" onChange={e => setFirstName(e.target.value)} />
      <br /><br />

      <input placeholder="Last Name" onChange={e => setLastName(e.target.value)} />
      <br /><br />

      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <br /><br />

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <br /><br />

      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <br /><br />
      <br /><br />

      <label><b>Dietary Restrictions</b></label><br />
      <select multiple onChange={e => handleMultiSelect(e, setDietaryRestrictions)}>
        {dietaryOptions.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <br /><br />

      <label><b>Symptoms</b></label><br />
      <select multiple onChange={e => handleMultiSelect(e, setSymptoms)}>
        {symptomOptions.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <br /><br />

      <label><b>Diagnoses</b></label><br />
      <select multiple onChange={e => handleMultiSelect(e, setDiagnoses)}>
        {diagnosisOptions.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <br /><br />
      <button onClick={handleSignup}>Create Account</button>
    </div>
  );
}

export default Signup;