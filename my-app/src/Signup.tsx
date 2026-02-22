import { useState } from "react";
import "./Signup.css";

function Signup() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("")
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [diagnoses, setDiagnoses] = useState<string[]>([]);

  
const dietaryOptions = [
  "None",
  "Gluten Intolerance",
  "Lactose Intolerance",
  "Fructose Intolerance",
  "Egg Sensitivity",
  "Food Color Sensitiviy"
  ];

const symptomOptions = [
  "None",
  "Stomach pain/cramps",
  "Bloating",
  "Diarrhea",
  "Gas",
  "Nausea",
  "Skin reactions (hives, rash, etc.)",
  "Headaches"
];

const diagnosisOptions = [
  "None",
  "Celiac",
  "Anemia",
  "IBS",
  "GERD",
  "Ulcers"
];
  const handleCheckbox = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    state: string[]
  ) => {
    if (state.includes(value)){
      setter(state.filter(item => item !== value));
    }
    else{
      setter([...state, value]);
    }
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
        gender,
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

      <input className = "signup-input" placeholder="First Name" onChange={e => setFirstName(e.target.value)} />

      <input className = "signup-input" placeholder="Last Name" onChange={e => setLastName(e.target.value)} />

      <input className = "signup-input" placeholder="Email" onChange={e => setEmail(e.target.value)} />

      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <br /><br />
      <br /><br />
        <label><b>Gender (optional)</b></label><br />
        <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        >
        <option value="">Prefer not to say</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="nonbinary">Non-binary</option>
        <option value="other">Other</option>
        </select>
        <br /><br />
      <label><b>Dietary Restrictions</b></label><br />
      <select multiple onChange={e => handleMultiSelect(e, setDietaryRestrictions)}>
        {dietaryOptions.map(opt => (
          <label key={opt} className="checkbox-label">
            <input
              type="checkbox"
              value={opt}
              checked={dietaryRestrictions.includes(opt)}
              onChange={() => handleCheckbox(opt, setDietaryRestrictions, dietaryRestrictions)}
            />
            {opt}
          </label>
        ))}
      </div>

      <label><b>Symptoms</b></label>
      <div className="checkbox-group">
        {symptomOptions.map(opt => (
          <label key={opt} className="checkbox-label">
            <input
              type="checkbox"
              value={opt}
              checked={symptoms.includes(opt)}
              onChange={() => handleCheckbox(opt, setSymptoms, symptoms)}
            />
            {opt}
          </label>
        ))}
      </div>

      <label><b>Diagnoses</b></label>
      <div className="checkbox-group">
        {diagnosisOptions.map(opt => (
          <label key={opt} className="checkbox-label">
            <input
              type="checkbox"
              value={opt}
              checked={diagnoses.includes(opt)}
              onChange={() => handleCheckbox(opt, setDiagnoses, diagnoses)}
            />
            {opt}
          </label>
        ))}
      </div>
      
      <button id = "signup-btn" onClick={handleSignup}>Create Account</button>
    </div>
  );
}

export default Signup;