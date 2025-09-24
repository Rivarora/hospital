from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="HealthSync API", description="AI-Powered Medical Records Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# AI Chat Setup
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    age: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tokens: int = 0
    
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    age: Optional[int] = None

class MedicalRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    content: str
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ai_summary: Optional[str] = None
    risk_assessment: Optional[str] = None
    
class MedicalRecordCreate(BaseModel):
    user_id: str
    filename: str
    content: str

class Habit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str
    sleep_hours: Optional[float] = None
    exercise_minutes: Optional[int] = None
    water_glasses: Optional[int] = None
    mood_rating: Optional[int] = None  # 1-5 scale
    notes: Optional[str] = None
    tokens_earned: int = 0
    
class HabitCreate(BaseModel):
    user_id: str
    sleep_hours: Optional[float] = None
    exercise_minutes: Optional[int] = None
    water_glasses: Optional[int] = None
    mood_rating: Optional[int] = None
    notes: Optional[str] = None

class PaperworkRequest(BaseModel):
    user_id: str
    form_type: str  # admission, discharge, referral
    hospital_name: str
    doctor_name: Optional[str] = None

class TokenTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: int
    transaction_type: str  # earned, spent, redeemed
    description: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper Functions
def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, dict):
                data[key] = prepare_for_mongo(value)
            elif isinstance(value, list):
                data[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
    return data

def parse_from_mongo(item):
    """Convert ISO strings back to datetime objects"""
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and 'T' in value and value.endswith(('Z', '+00:00')):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except ValueError:
                    pass
            elif isinstance(value, dict):
                item[key] = parse_from_mongo(value)
            elif isinstance(value, list):
                item[key] = [parse_from_mongo(i) if isinstance(i, dict) else i for i in value]
    return item

async def analyze_medical_record(content: str) -> dict:
    """Analyze medical record using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"medical_analysis_{uuid.uuid4()}",
            system_message="You are a medical AI assistant. Analyze medical records and provide health summaries and risk assessments in a professional manner."
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"""Analyze this medical record and provide:
1. A clear, patient-friendly summary (2-3 sentences)
2. Risk assessment for common conditions (diabetes, heart disease, hypertension)
3. Recommendations for lifestyle improvements

Medical Record Content:
{content}

Please format your response as JSON with keys: summary, risk_assessment, recommendations"""
        )
        
        response = await chat.send_message(user_message)
        
        # Try to parse as JSON, fallback to structured text
        try:
            analysis = json.loads(response)
        except json.JSONDecodeError:
            analysis = {
                "summary": response[:200] + "..." if len(response) > 200 else response,
                "risk_assessment": "AI analysis completed. Please consult with healthcare provider for detailed assessment.",
                "recommendations": "Maintain regular checkups and follow medical advice."
            }
        
        return analysis
    except Exception as e:
        logging.error(f"AI analysis error: {e}")
        return {
            "summary": "Medical record uploaded successfully. AI analysis temporarily unavailable.",
            "risk_assessment": "Please consult healthcare provider for assessment.",
            "recommendations": "Follow prescribed treatment plan."
        }

async def generate_paperwork(user_data: dict, form_type: str, hospital_name: str, doctor_name: str = None) -> str:
    """Generate smart paperwork using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"paperwork_{uuid.uuid4()}",
            system_message="You are a medical administrative assistant. Generate professional medical forms and documents."
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"""Generate a {form_type} form for:
Hospital: {hospital_name}
Doctor: {doctor_name or "Staff Doctor"}
Patient: {user_data.get('name', 'Patient')}
Age: {user_data.get('age', 'Not specified')}

Please create a professional medical {form_type} form with standard fields and patient information pre-filled where available."""
        )
        
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logging.error(f"Paperwork generation error: {e}")
        return f"Generated {form_type} form for {user_data.get('name', 'Patient')} at {hospital_name}. Please complete additional details as needed."

# Routes

# User Management
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    user_dict = user_data.dict()
    user_obj = User(**user_dict)
    user_dict = prepare_for_mongo(user_obj.dict())
    await db.users.insert_one(user_dict)
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = parse_from_mongo(user)
    return User(**user)

@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find().to_list(100)
    return [User(**parse_from_mongo(user)) for user in users]

# Medical Records
@api_router.post("/medical-records", response_model=MedicalRecord)
async def upload_medical_record(record_data: MedicalRecordCreate):
    # Analyze the medical record with AI
    analysis = await analyze_medical_record(record_data.content)
    
    record_dict = record_data.dict()
    record_dict["ai_summary"] = analysis.get("summary", "")
    record_dict["risk_assessment"] = analysis.get("risk_assessment", "")
    
    record_obj = MedicalRecord(**record_dict)
    record_dict = prepare_for_mongo(record_obj.dict())
    await db.medical_records.insert_one(record_dict)
    
    # Award tokens for uploading record
    await award_tokens(record_data.user_id, 50, "Medical record upload")
    
    return record_obj

@api_router.get("/medical-records/{user_id}", response_model=List[MedicalRecord])
async def get_user_medical_records(user_id: str):
    records = await db.medical_records.find({"user_id": user_id}).to_list(100)
    return [MedicalRecord(**parse_from_mongo(record)) for record in records]

# Habit Tracking
@api_router.post("/habits", response_model=Habit)
async def log_habit(habit_data: HabitCreate):
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Check if habit already logged today
    existing = await db.habits.find_one({"user_id": habit_data.user_id, "date": today})
    if existing:
        raise HTTPException(status_code=400, detail="Habit already logged for today")
    
    # Calculate tokens based on healthy habits
    tokens_earned = 0
    if habit_data.sleep_hours and habit_data.sleep_hours >= 7:
        tokens_earned += 20
    if habit_data.exercise_minutes and habit_data.exercise_minutes >= 30:
        tokens_earned += 30
    if habit_data.water_glasses and habit_data.water_glasses >= 8:
        tokens_earned += 15
    if habit_data.mood_rating and habit_data.mood_rating >= 4:
        tokens_earned += 10
    
    habit_dict = habit_data.dict()
    habit_dict["date"] = today
    habit_dict["tokens_earned"] = tokens_earned
    
    habit_obj = Habit(**habit_dict)
    habit_dict = prepare_for_mongo(habit_obj.dict())
    await db.habits.insert_one(habit_dict)
    
    # Award tokens
    if tokens_earned > 0:
        await award_tokens(habit_data.user_id, tokens_earned, f"Healthy habits - {today}")
    
    return habit_obj

@api_router.get("/habits/{user_id}", response_model=List[Habit])
async def get_user_habits(user_id: str):
    habits = await db.habits.find({"user_id": user_id}).sort("date", -1).to_list(30)
    return [Habit(**parse_from_mongo(habit)) for habit in habits]

# Smart Paperwork
@api_router.post("/paperwork")
async def generate_smart_paperwork(paperwork_request: PaperworkRequest):
    # Get user data
    user = await db.users.find_one({"id": paperwork_request.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = parse_from_mongo(user)
    
    # Generate paperwork
    paperwork_content = await generate_paperwork(
        user_data, 
        paperwork_request.form_type, 
        paperwork_request.hospital_name,
        paperwork_request.doctor_name
    )
    
    # Award tokens for paperwork generation
    await award_tokens(paperwork_request.user_id, 25, "Smart paperwork generation")
    
    return {
        "form_type": paperwork_request.form_type,
        "content": paperwork_content,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

# Token System
async def award_tokens(user_id: str, amount: int, description: str):
    """Award tokens to user and log transaction"""
    # Update user tokens
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"tokens": amount}}
    )
    
    # Log transaction
    transaction = TokenTransaction(
        user_id=user_id,
        amount=amount,
        transaction_type="earned",
        description=description
    )
    transaction_dict = prepare_for_mongo(transaction.dict())
    await db.token_transactions.insert_one(transaction_dict)

@api_router.get("/tokens/{user_id}")
async def get_user_tokens(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    transactions = await db.token_transactions.find({"user_id": user_id}).sort("timestamp", -1).to_list(50)
    
    return {
        "current_tokens": user.get("tokens", 0),
        "transaction_history": [TokenTransaction(**parse_from_mongo(t)) for t in transactions]
    }

# Dashboard Data
@api_router.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str):
    # Get user
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get recent medical records
    records = await db.medical_records.find({"user_id": user_id}).sort("upload_date", -1).limit(5).to_list(5)
    
    # Get recent habits
    habits = await db.habits.find({"user_id": user_id}).sort("date", -1).limit(7).to_list(7)
    
    # Get token summary
    total_earned = await db.token_transactions.aggregate([
        {"$match": {"user_id": user_id, "transaction_type": "earned"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    return {
        "user": User(**parse_from_mongo(user)),
        "recent_records": [MedicalRecord(**parse_from_mongo(r)) for r in records],
        "recent_habits": [Habit(**parse_from_mongo(h)) for h in habits],
        "tokens_earned_total": total_earned[0]["total"] if total_earned else 0
    }

# Health Routes
@api_router.get("/")
async def root():
    return {"message": "HealthSync API - AI-Powered Medical Records Platform"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)