const apiModel = "gemini-2.5-flash";
const apiKey = import.meta.env.GEMINI_API_KEY;

export interface Recipe {
    title: string;
    description: string;
    ingredients: string[];
    prep_time: string;
    cook_time: string;
    total_time: string;
    steps: string[];
}

export async function fetchRecipes(healthCondition: string, symptoms: string, dietaryRestrictions: string): Promise<Recipe[]>{
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`;

    const prompt = 
    `SYSTEM SETTINGS: You are a professional nutritionist and chef. You create healthy, practical recipes tailored to a user's medical conditions, symptoms, and dietary restrictions.

    TASK:
    Generate exactly 3 recipes that address the user's health needs and respect their dietary restrictions.

    CONSTRAINTS:
    - Recipes must be realistic and use commonly available ingredients.
    - Prioritize ingredients known to help alleviate the provided symptoms or support the health conditions.
    - Strictly respect all dietary restrictions — do NOT include any restricted ingredients.
    - If any fields are empty or null, ignore them and focus only on the fields that are provided.
    - If ALL fields are empty or null, generate 3 generally healthy and balanced recipes.
    - Avoid rare, overly technical, or hard-to-find ingredients.
    - Do NOT add commentary.
    - Do NOT include markdown formatting.
    - Return raw JSON only.

    INPUT:
    Health Condition: "${healthCondition}"
    Symptoms: "${symptoms}"
    Dietary Restrictions: "${dietaryRestrictions}"

    OUTPUT REQUIREMENTS:
    - Return ONLY valid JSON.
    - Do NOT wrap the response in markdown.
    - Do NOT include explanations.
    - Each recipe must include a short title and a brief description explaining what the recipe is and which symptoms or conditions it helps address.
    - Ingredient amounts must be provided in BOTH customary and metric units as two separate arrays (e.g., ["1 cup spinach", "2 tbsp honey"]) and ["30g spinach", "40ml honey"]).
    - Prep time, cook time, and total time must be human-readable strings (e.g., "15 minutes").
    - Total time must equal prep time + cook time.
    - Steps must be an array where each element is a single step as a string.

    Return the result strictly in this format:

    [
      {
        "title": "",
        "description": "",
        "customary_ingredients": [
          "",
          ""
        ],
        "metric_ingredients": [
          "",
          ""
        ],
        "prep_time": "",
        "cook_time": "",
        "total_time": "",
        "steps": [
          "",
          ""
        ]
      },
      {
        "title": "",
        "description": "",
        "customary_ingredients": [
          "",
          ""
        ],
        "metric_ingredients": [
          "",
          ""
        ],
        "prep_time": "",
        "cook_time": "",
        "total_time": "",
        "steps": [
          "",
          ""
        ]
      },
      {
        "title": "",
        "description": "",
        "customary_ingredients": [
          "",
          ""
        ],
        "metric_ingredients": [
          "",
          ""
        ],
        "prep_time": "",
        "cook_time": "",
        "total_time": "",
        "steps": [
          "",
          ""
        ]
      }
    ]`

    const body = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ]
    };

    try{
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if(!response.ok){
            throw new Error("Could not fetch API data");
        }

        const rawData = await response.json();
        const text = rawData.candidates[0].content.parts[0].text;
        const convertedData: Recipe[] = JSON.parse(text);

        return convertedData;
    }
    catch (error){
        console.error("Error fetching recipes", error);
        throw error;
    }
}