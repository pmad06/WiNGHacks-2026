import { useState } from "react";
import type { CSSProperties } from "react";
import { useEffect} from "react"
const inputStyle: CSSProperties = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px"
}

const labelStyle: CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#354a2f"
}

const fieldStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
}


function Profile(){
    const [personal, setPersonal] = useState({
        firstName: "",
        lastName: "",
        email: "",
        gender: "",
    });

    const [health, setHealth] = useState({
        conditions: "",
        symptoms: "",
        restrictions: "",
    });
    useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    setPersonal({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        gender: user.gender || "",
    });

    setHealth({
        conditions: (user.diagnoses || []).join(", "),
        symptoms: (user.symptoms || []).join(", "),
        restrictions: (user.dietaryRestrictions || []).join(", "),
    });
    }, []);
 return(
        <div 
            style = {{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "32px 80px",
            }}
        >
            <div
                style = {{
                    backgroundColor: "#dce3c7",
                    padding: "24px",
                    borderRadius: "8px",
                    border: "3px solid #354a2f",
                    width: "100%",
                    marginBottom: "24px",
                }}
            >
                <h2>Personal Information</h2>

                <div
                    style = {{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
                    <div style = {fieldStyle}>
                        <label style = {labelStyle}>First Name</label>
                        <input
                            type = "text"
                            style={inputStyle}
                             value={personal.firstName}
                            readOnly
                        >
                        </input>
                    </div>

                    <div style = {fieldStyle}>
                        <label style = {labelStyle}>Last Name</label>
                        <input
                            type = "text"
                            style={inputStyle}
                            value={personal.lastName}
                            readOnly
                        >
                        </input>
                    </div>

                    <div style = {fieldStyle}>
                        <label style = {labelStyle}>Email</label>
                        <input
                            type = "text"
                            style={inputStyle}
                            value={personal.email}
                            readOnly
                        >
                        </input>
                    </div>

                    <div style = {fieldStyle}>
                        <label style = {labelStyle}>Gender</label>
                        <input
                            type = "text"
                            style={inputStyle}
                            value={personal.gender}
                            readOnly
                        >
                        </input>
                    </div>
                 </div>
            </div>

            <div
                style = {{
                    backgroundColor: "#dce3c7",
                    borderRadius: "8px",
                    border: "3px solid #354a2f",
                    padding: "24px",
                    width: "100%",
                }}
            >
                <h2>Health Information</h2>

                <div
                    style = {{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
                    <div style = {fieldStyle}>
                        <label style = {labelStyle}>Health Conditions</label>
                        <input
                            type = "text"
                            style={inputStyle}
                            value={health.conditions}
                            readOnly
                        >
                        </input>
                    </div>

                    <div style = {fieldStyle}>
                        <label style = {labelStyle}>Dietary Restrictions</label>
                        <input
                            type = "text"
                            style={inputStyle}
                             value={health.restrictions}
                            readOnly
                        >
                        </input>
                    </div>

                    <div style = {fieldStyle}>
                        <label style = {labelStyle}>Symptoms</label>
                        <input
                            type = "text"
                            style={inputStyle}
                            value={health.symptoms}
                            readOnly
                        >
                        </input>
                    </div>
                 </div>
            </div>
        </div>
    );
}
export default Profile