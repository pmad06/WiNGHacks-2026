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
        <div>
            <h2>{data.name}</h2>
            <p>{data.summary}</p>
            <p>{data.symptoms}</p>
            <p>{data.foods_to_avoid}</p>
            <p>{data.substitutes}</p>
        </div>
    );
}
export default HealthInfo