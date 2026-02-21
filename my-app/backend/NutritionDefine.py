from fastapi import FastAPI, HTTPException
import httpx
import json 
import xml.etree.ElementTree as ET
import re
from pathlib import Path

app = FastAPI()

USDA_API_KEY = "fRlPB0DYUHi4IS3d0khY6D1bvjITa8CUreWeMX7a"
MEDLINE_BASE_URL = "https://wsearch.nlm.nih.gov/ws/query"

BASE_DIR = Path(__file__).resolve().parent
with open (BASE_DIR / "triggers.json", "r") as f:
    trigger_data = json.load(f)
    CATEGORIES = trigger_data["categories"]

CATEGORY_SYMPTOM_QUERIES = {
    "Gluten Sensitivity": "gluten sensitivity symptoms",
    "Lactose Intolerance": "lactose intolerance symptoms",
    "Period Sensitivity": "menstrual cycle effects",
    "General Inflammation": "inflammation symptoms",
}

@app.get("/analyze-food")
async def analyze_food(query: str):
    async with httpx.AsyncClient() as client:
        usda_res = await client.get(
            "https://api.nal.usda.gov/fdc/v1/foods/search",
            params={"api_key": USDA_API_KEY, "query": query, "dataType": "Branded"},
        )

        data = usda_res.json()
        if not data.get("foods"):
            raise HTTPException(status_code=404, detail="Food not found")
        
        product = data["foods"][0]
        ingredients_str = product.get("ingredients", "").lower()

        medline_tasks = []
        for category, ingredients in CATEGORIES.items():
            for trigger in ingredients:
                if trigger in ingredients_str:
                    search_term = f"{trigger} {CATEGORY_SYMPTOM_QUERIES.get(category, 'symptoms')}"
                    try:
                        medline_res = await client.get(
                            MEDLINE_BASE_URL,
                            params={"db": "healthTopics", "term": search_term},
                            timeout=5.0,
                        )
                        if medline_res.status_code == 200:
                            root = ET.fromstring(medline_res.text)
                            summary = "No detailed medical summary found."
                            for content in root.iter("content"):
                                if content.get("name") == "FullSummary":
                                    raw = content.text or ""
                                    clean = re.sub(r'<[^>]+>', '', raw).strip()
                                    sentences = re.split(r'(?<=[.!?])\s+', clean)
                                    summary = ' '.join(sentences[:2])
                                    break
                            medline_tasks.append({
                                "category": category,
                                "trigger_ingredient": trigger,
                                "medical_info": summary,
                            })
                            break
                    except Exception as e:
                        print(f"Error fetching Medline data for {trigger}: {e}")
                        continue

        return {
            "product_name": product.get("description"),
            "ingredients": ingredients_str,
            "medline_results": medline_tasks,
            "matched_triggers": [
             {"category": cat, "trigger": t}
                for cat, triggers in CATEGORIES.items()
                for t in triggers
                if t in ingredients_str
            ]
        }
    
