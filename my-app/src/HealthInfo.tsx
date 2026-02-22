import dietRestrictions from "./dietRestrictions.json";
import {useState} from "react";

interface Restrictions{
    id: string;
    name: string,
    symptoms: string[],
    summary: string,
    foods_to_avoid: string[]
    substitutes: string[],
}

interface Diagnosis {
    id: string; 
    name: string; 
    summary: string; 
    symptoms: string[];
    doctor: string;
}


function HealthInfo(){
    const conditions: Restrictions[] = dietRestrictions.conditions;
    const diagnoses: Diagnosis[] = dietRestrictions.diagnoses;
        return (
            <div style = {{padding: "24px", fontFamily: "georgia, serif"}}>
                <h2 style = {{marginBottom: "16px"}}>Health Information</h2>
                <div
                style = {{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    padding: "16px",
                }}
                >
                {conditions.map((condition) => (
                    <CardSummary key={condition.id} data={condition} />
            ))}
            </div>
            <div style = {{padding: "24px", fontFamily: "georgia, serif"}}>
                <h2 style = {{marginBottom: "16px"}}>Diagnoses</h2>
                <div
                style = {{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    padding: "16px",
                }}
                >
                {diagnoses.map((diagnosis) => (
                    <DiagnosisCardSummary key={diagnosis.id} data={diagnosis} />
            ))}
            </div>
            </div>
        </div>
  );
}

function DropDownMenu({
    title,
    isOpen,
    onToggle,
    children,
}:{
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div style={{ borderTop: "1px solid #354a2f", marginTop: "8px" }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 0",
          cursor: "pointer",
          fontWeight: 600,
          color: "#354a2f",
        }}
      >
        {title}
        <span style={{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          display: "inline-block",
        }}>
          ▾
        </span>
      </div>

      <div style={{
        maxHeight: isOpen ? "400px" : "0px",
        overflow: "hidden",
        transition: "max-height 0.3s ease",
        color: "#2a2a2a",
        fontSize: "14px",
        paddingBottom: isOpen ? "10px" : "0px",
      }}>
        {children}
      </div>
    </div>
    );
}

function CardSummary({data} : {data:Restrictions}){
    const [dropDown, setDropdown] = useState<string | null>(null);

    const toggleDropdown = (id: string) => {
        setDropdown(dropDown === id ? null : id);
    };
    return (
        
        <div 
        style={{
                margin: "0 auto",
                background: "#dce3c7",    
                borderRadius: "24px",
                border: "3px solid #354a2f",
                padding: "24px",
                boxShadow: "0 4px 24px rgba(10,0,0,0.08)",
                marginBottom: "24px",
                marginTop: "24px",
                marginLeft: "24px",
                marginRight: "24px",
                fontFamily: "georgia,serif"
            }}>
            <h2>{data.name}</h2>

            <DropDownMenu
                title = "Summary"
                isOpen = {dropDown === "summary"}
                onToggle = {() => toggleDropdown("summary")}
            >
                <p style = {{ margin: 0}}>{data.summary}</p>
            </DropDownMenu>
            <DropDownMenu
                title = "Symptoms"
                isOpen = {dropDown === "symptoms"}
                onToggle = {() => toggleDropdown("symptoms")}
            >
                <p style = {{ margin: 0}}>{data.symptoms}</p>
            </DropDownMenu>
            <DropDownMenu
                title = "Foods to Avoid"
                isOpen = {dropDown === "foods_to_avoid"}
                onToggle = {() => toggleDropdown("foods_to_avoid")}
            >
                <p style = {{ margin: 0}}>{data.foods_to_avoid}</p>
            </DropDownMenu>
            <DropDownMenu
                title = "Substitutes"
                isOpen = {dropDown === "substitutes"}
                onToggle = {() => toggleDropdown("substitutes")}
            >
                <p style = {{ margin: 0}}>{data.substitutes}</p>
            </DropDownMenu>
        </div>
    );
}

function DiagnosisCardSummary({data} : {data:Diagnosis}){
    const [dropDown, setDropdown] = useState<string | null>(null);

    const toggleDropdown = (id: string) => {
        setDropdown(dropDown === id ? null : id);
    };
    
    return (
    <div
      style={{
        background: "#dce3c7",
        borderRadius: "24px",
        border: "3px solid #354a2f",
        padding: "24px",
        boxShadow: "0 4px 24px rgba(10,0,0,0.08)",
        margin: "12px",
        fontFamily: "georgia, serif",
      }}
    >
      <h2 style={{ margin: "0 0 8px 0" }}>{data.name}</h2>

      <DropDownMenu
        title="Summary"
        isOpen={dropDown === "summary"}
        onToggle={() => toggleDropdown("summary")}
      >
        <p style={{ margin: 0 }}>{data.summary}</p>
      </DropDownMenu>

      <DropDownMenu
        title="Symptoms"
        isOpen={dropDown === "symptoms"}
        onToggle={() => toggleDropdown("symptoms")}
      >
        <ul style={{ margin: 0, paddingLeft: "18px" }}>
          {data.symptoms.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </DropDownMenu>

      <DropDownMenu
        title="When to See a Doctor"
        isOpen={dropDown === "doctor"}
        onToggle={() => toggleDropdown("doctor")}
      >
        <p style={{ margin: 0 }}>{data.doctor}</p>
      </DropDownMenu>
    </div>
  );
}

export default HealthInfo