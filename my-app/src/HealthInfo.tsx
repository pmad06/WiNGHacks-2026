import dietRestrictions from "./dietRestrictions.json";

interface Restrictions{
    id: string;
    name: string,
    symptoms: string[],
    summary: string,
    foods_to_avoid: string[]
    substitutes: string[],
}


function HealthInfo(){
    const conditions: Restrictions[] = dietRestrictions.conditions;
        return (
            
                <div>
                {conditions.map((condition) => (
                    <CardSummary key={condition.id} data={condition} />
            ))}
            </div>
  );
}

function CardSummary({data} : {data:Restrictions}){
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
            <p>{data.summary}</p>
            <p>{data.symptoms}</p>
            <p>{data.foods_to_avoid}</p>
            <p>{data.substitutes}</p>
        </div>
    );
}
export default HealthInfo