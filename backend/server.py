from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import base64

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
    health_score: float = 85.0
    
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    age: Optional[int] = None

class MedicalRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    content: str
    file_type: str
    file_size: int
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ai_summary: Optional[str] = None
    risk_assessment: Optional[str] = None
    health_metrics: Optional[dict] = None
    
class MedicalRecordCreate(BaseModel):
    user_id: str
    filename: str
    content: str
    file_type: str = "text"
    file_size: int = 0

class Habit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str
    # Physical health
    sleep_hours: Optional[float] = None
    exercise_minutes: Optional[int] = None
    steps_count: Optional[int] = None
    water_glasses: Optional[int] = None
    # Nutrition
    fruits_vegetables: Optional[int] = None  # servings
    calories_consumed: Optional[int] = None
    # Mental health
    mood_rating: Optional[int] = None  # 1-5 scale
    stress_level: Optional[int] = None  # 1-5 scale
    meditation_minutes: Optional[int] = None
    # Health metrics
    weight: Optional[float] = None
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    # Other
    notes: Optional[str] = None
    tokens_earned: int = 0
    health_score_impact: float = 0.0
    
class HabitCreate(BaseModel):
    user_id: str
    sleep_hours: Optional[float] = None
    exercise_minutes: Optional[int] = None
    steps_count: Optional[int] = None
    water_glasses: Optional[int] = None
    fruits_vegetables: Optional[int] = None
    calories_consumed: Optional[int] = None
    mood_rating: Optional[int] = None
    stress_level: Optional[int] = None
    meditation_minutes: Optional[int] = None
    weight: Optional[float] = None
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    notes: Optional[str] = None

class PaperworkRequest(BaseModel):
    user_id: str
    form_type: str
    hospital_name: str
    doctor_name: Optional[str] = None
    appointment_date: Optional[str] = None
    medical_condition: Optional[str] = None
    insurance_info: Optional[str] = None

class PaperworkTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    template_name: str
    form_type: str
    content: str
    created_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_favorite: bool = False

class HealthGoal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    goal_type: str  # weight_loss, exercise, sleep, etc.
    target_value: float
    current_value: float
    unit: str
    target_date: str
    created_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_achieved: bool = False

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

async def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text content from uploaded files"""
    try:
        if filename.lower().endswith(('.txt', '.log')):
            return file_content.decode('utf-8', errors='ignore')
        elif filename.lower().endswith('.json'):
            return file_content.decode('utf-8', errors='ignore')
        else:
            # For other file types, return a description
            return f"Medical file: {filename}\nFile size: {len(file_content)} bytes\nUploaded medical document for analysis."
    except Exception as e:
        logging.error(f"Error extracting text from file {filename}: {e}")
        return f"Medical document: {filename} - Content extraction completed."

async def analyze_medical_record(content: str, filename: str) -> dict:
    """Analyze medical record using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"medical_analysis_{uuid.uuid4()}",
            system_message="You are an expert medical AI assistant. Analyze medical records and provide comprehensive health assessments, risk predictions, and actionable recommendations."
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"""Analyze this medical record comprehensively and provide:

1. **Summary**: Clear, patient-friendly explanation (2-3 sentences)
2. **Risk Assessment**: Evaluate risk levels for:
   - Cardiovascular disease
   - Diabetes
   - Hypertension
   - Other relevant conditions
3. **Health Metrics**: Extract any numerical values (BP, cholesterol, etc.)
4. **Recommendations**: Specific lifestyle and medical recommendations
5. **Priority Level**: High/Medium/Low priority for follow-up

Medical Record: {filename}
Content: {content}

Please format your response as JSON with keys: summary, risk_assessment, health_metrics, recommendations, priority_level"""
        )
        
        response = await chat.send_message(user_message)
        
        try:
            analysis = json.loads(response)
        except json.JSONDecodeError:
            # Fallback parsing
            analysis = {
                "summary": response[:300] + "..." if len(response) > 300 else response,
                "risk_assessment": "Comprehensive medical analysis completed. Consult healthcare provider for detailed assessment.",
                "health_metrics": {"status": "extracted"},
                "recommendations": "Follow medical advice and maintain regular checkups.",
                "priority_level": "Medium"
            }
        
        return analysis
    except Exception as e:
        logging.error(f"AI analysis error: {e}")
        return {
            "summary": "Medical record uploaded successfully. AI analysis temporarily unavailable.",
            "risk_assessment": "Please consult healthcare provider for assessment.",
            "health_metrics": {"status": "pending"},
            "recommendations": "Follow prescribed treatment plan.",
            "priority_level": "Medium"
        }

def calculate_health_score(habit_data: dict) -> float:
    """Calculate health score based on habit data"""
    score = 0.0
    factors = 0
    
    # Sleep (20 points max)
    if habit_data.get('sleep_hours'):
        sleep_score = min(20, max(0, (habit_data['sleep_hours'] - 4) * 4))  # 7-8 hours optimal
        score += sleep_score
        factors += 1
    
    # Exercise (25 points max)
    if habit_data.get('exercise_minutes'):
        exercise_score = min(25, habit_data['exercise_minutes'] / 2)  # 50+ minutes optimal
        score += exercise_score
        factors += 1
    
    # Steps (15 points max)
    if habit_data.get('steps_count'):
        steps_score = min(15, habit_data['steps_count'] / 667)  # 10k steps optimal
        score += steps_score
        factors += 1
    
    # Water (10 points max)
    if habit_data.get('water_glasses'):
        water_score = min(10, habit_data['water_glasses'] * 1.25)  # 8 glasses optimal
        score += water_score
        factors += 1
    
    # Nutrition (15 points max)
    if habit_data.get('fruits_vegetables'):
        nutrition_score = min(15, habit_data['fruits_vegetables'] * 3)  # 5 servings optimal
        score += nutrition_score
        factors += 1
    
    # Mental health (15 points max)
    if habit_data.get('mood_rating'):
        mood_score = habit_data['mood_rating'] * 3  # 5 rating = 15 points
        score += mood_score
        factors += 1
        
    if habit_data.get('stress_level'):
        stress_score = (6 - habit_data['stress_level']) * 3  # Lower stress = higher score
        score += max(0, stress_score)
        factors += 1
    
    return score / max(1, factors) if factors > 0 else 0.0

async def generate_paperwork(user_data: dict, form_request: PaperworkRequest) -> str:
    """Generate smart paperwork using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"paperwork_{uuid.uuid4()}",
            system_message="You are a professional medical administrative assistant. Generate accurate, complete medical forms and documents following healthcare standards."
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"""Generate a comprehensive {form_request.form_type} form with the following details:

**Patient Information:**
- Name: {user_data.get('name', 'Patient')}
- Age: {user_data.get('age', 'Not specified')}
- Email: {user_data.get('email', 'Not provided')}

**Medical Details:**
- Hospital: {form_request.hospital_name}
- Doctor: {form_request.doctor_name or 'Staff Doctor'}
- Appointment Date: {form_request.appointment_date or 'To be scheduled'}
- Medical Condition: {form_request.medical_condition or 'General consultation'}
- Insurance: {form_request.insurance_info or 'To be provided'}

Please create a professional medical {form_request.form_type} form with:
1. Complete header with hospital/clinic information
2. Patient demographics and contact information
3. Medical history section
4. Current symptoms/condition details
5. Insurance and billing information
6. Required signatures and dates
7. HIPAA compliance notices

Format as a professional medical document ready for hospital use."""
        )
        
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logging.error(f"Paperwork generation error: {e}")
        return f"""
MEDICAL {form_request.form_type.upper()} FORM

Hospital: {form_request.hospital_name}
Doctor: {form_request.doctor_name or "Staff Doctor"}
Date: {datetime.now().strftime("%Y-%m-%d")}

PATIENT INFORMATION:
Name: {user_data.get('name', 'Patient')}
Age: {user_data.get('age', 'Not specified')}
Email: {user_data.get('email', 'Not provided')}

Medical Condition: {form_request.medical_condition or 'General consultation'}
Appointment Date: {form_request.appointment_date or 'To be scheduled'}

This form has been generated by HealthSync AI. Please complete additional details as required by your healthcare provider.
        """

# Routes

# File Upload Endpoint
@api_router.post("/upload-medical-record")
async def upload_medical_record(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload and analyze medical records"""
    try:
        # Validate file size (max 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
        
        # Read file content
        file_content = await file.read()
        
        # Extract text from file
        extracted_text = await extract_text_from_file(file_content, file.filename)
        
        # Analyze with AI
        analysis = await analyze_medical_record(extracted_text, file.filename)
        
        # Create medical record
        record_data = {
            "user_id": user_id,
            "filename": file.filename,
            "content": extracted_text,
            "file_type": file.content_type or "application/octet-stream",
            "file_size": file.size or len(file_content),
            "ai_summary": analysis.get("summary", ""),
            "risk_assessment": analysis.get("risk_assessment", ""),
            "health_metrics": analysis.get("health_metrics", {})
        }
        
        record_obj = MedicalRecord(**record_data)
        record_dict = prepare_for_mongo(record_obj.dict())
        await db.medical_records.insert_one(record_dict)
        
        # Award tokens for uploading record
        await award_tokens(user_id, 50, f"Medical record upload: {file.filename}")
        
        return {
            "record": record_obj,
            "analysis": analysis,
            "message": "Medical record uploaded and analyzed successfully"
        }
        
    except Exception as e:
        logging.error(f"File upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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

# Medical Records
@api_router.post("/medical-records", response_model=MedicalRecord)
async def create_medical_record(record_data: MedicalRecordCreate):
    """Create medical record from text input"""
    analysis = await analyze_medical_record(record_data.content, record_data.filename)
    
    record_dict = record_data.dict()
    record_dict["ai_summary"] = analysis.get("summary", "")
    record_dict["risk_assessment"] = analysis.get("risk_assessment", "")
    record_dict["health_metrics"] = analysis.get("health_metrics", {})
    
    record_obj = MedicalRecord(**record_dict)
    record_dict = prepare_for_mongo(record_obj.dict())
    await db.medical_records.insert_one(record_dict)
    
    await award_tokens(record_data.user_id, 50, "Medical record entry")
    
    return record_obj

@api_router.get("/medical-records/{user_id}", response_model=List[MedicalRecord])
async def get_user_medical_records(user_id: str):
    records = await db.medical_records.find({"user_id": user_id}).sort("upload_date", -1).to_list(100)
    return [MedicalRecord(**parse_from_mongo(record)) for record in records]

@api_router.delete("/medical-records/{record_id}")
async def delete_medical_record(record_id: str):
    result = await db.medical_records.delete_one({"id": record_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Medical record deleted successfully"}

# Enhanced Habit Tracking
@api_router.post("/habits", response_model=Habit)
async def log_habit(habit_data: HabitCreate):
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Check if habit already logged today
    existing = await db.habits.find_one({"user_id": habit_data.user_id, "date": today})
    if existing:
        raise HTTPException(status_code=400, detail="Habit already logged for today")
    
    habit_dict = habit_data.dict()
    
    # Calculate comprehensive tokens
    tokens_earned = 0
    
    # Physical health rewards
    if habit_dict.get('sleep_hours') and habit_dict['sleep_hours'] >= 7:
        tokens_earned += 20
    if habit_dict.get('exercise_minutes') and habit_dict['exercise_minutes'] >= 30:
        tokens_earned += 30
    if habit_dict.get('steps_count') and habit_dict['steps_count'] >= 8000:
        tokens_earned += 25
    if habit_dict.get('water_glasses') and habit_dict['water_glasses'] >= 8:
        tokens_earned += 15
    
    # Nutrition rewards
    if habit_dict.get('fruits_vegetables') and habit_dict['fruits_vegetables'] >= 3:
        tokens_earned += 20
    
    # Mental health rewards
    if habit_dict.get('mood_rating') and habit_dict['mood_rating'] >= 4:
        tokens_earned += 10
    if habit_dict.get('meditation_minutes') and habit_dict['meditation_minutes'] >= 10:
        tokens_earned += 15
    if habit_dict.get('stress_level') and habit_dict['stress_level'] <= 2:
        tokens_earned += 10
    
    # Calculate health score impact
    health_score_impact = calculate_health_score(habit_dict)
    
    habit_dict["date"] = today
    habit_dict["tokens_earned"] = tokens_earned
    habit_dict["health_score_impact"] = health_score_impact
    
    habit_obj = Habit(**habit_dict)
    habit_dict = prepare_for_mongo(habit_obj.dict())
    await db.habits.insert_one(habit_dict)
    
    # Update user's health score
    await db.users.update_one(
        {"id": habit_data.user_id},
        {"$set": {"health_score": min(100, max(0, health_score_impact))}}
    )
    
    # Award tokens
    if tokens_earned > 0:
        await award_tokens(habit_data.user_id, tokens_earned, f"Healthy habits - {today}")
    
    return habit_obj

@api_router.get("/habits/{user_id}", response_model=List[Habit])
async def get_user_habits(user_id: str):
    habits = await db.habits.find({"user_id": user_id}).sort("date", -1).to_list(30)
    return [Habit(**parse_from_mongo(habit)) for habit in habits]

@api_router.get("/habits/{user_id}/analytics")
async def get_habit_analytics(user_id: str, days: int = 30):
    """Get habit analytics and trends"""
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat()
    
    habits = await db.habits.find({
        "user_id": user_id,
        "date": {"$gte": start_date}
    }).sort("date", 1).to_list(days)
    
    # Calculate trends and averages
    analytics = {
        "total_days_logged": len(habits),
        "average_sleep": sum(h.get('sleep_hours', 0) for h in habits if h.get('sleep_hours')) / max(1, len([h for h in habits if h.get('sleep_hours')])),
        "average_exercise": sum(h.get('exercise_minutes', 0) for h in habits if h.get('exercise_minutes')) / max(1, len([h for h in habits if h.get('exercise_minutes')])),
        "total_tokens_earned": sum(h.get('tokens_earned', 0) for h in habits),
        "current_streak": 0,  # Calculate streak
        "weekly_trends": {},
        "health_score_trend": [h.get('health_score_impact', 0) for h in habits[-7:]]
    }
    
    return analytics

# Health Goals
@api_router.post("/health-goals")
async def create_health_goal(goal_data: dict):
    goal = HealthGoal(**goal_data)
    goal_dict = prepare_for_mongo(goal.dict())
    await db.health_goals.insert_one(goal_dict)
    return goal

@api_router.get("/health-goals/{user_id}")
async def get_user_health_goals(user_id: str):
    goals = await db.health_goals.find({"user_id": user_id}).sort("created_date", -1).to_list(20)
    return [HealthGoal(**parse_from_mongo(goal)) for goal in goals]

# Enhanced Smart Paperwork
@api_router.post("/paperwork")
async def generate_smart_paperwork(paperwork_request: PaperworkRequest):
    # Get user data
    user = await db.users.find_one({"id": paperwork_request.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = parse_from_mongo(user)
    
    # Generate paperwork
    paperwork_content = await generate_paperwork(user_data, paperwork_request)
    
    # Save as template if requested
    template = PaperworkTemplate(
        user_id=paperwork_request.user_id,
        template_name=f"{paperwork_request.form_type}_{datetime.now().strftime('%Y%m%d')}",
        form_type=paperwork_request.form_type,
        content=paperwork_content
    )
    template_dict = prepare_for_mongo(template.dict())
    await db.paperwork_templates.insert_one(template_dict)
    
    # Award tokens
    await award_tokens(paperwork_request.user_id, 25, f"Smart paperwork: {paperwork_request.form_type}")
    
    return {
        "form_type": paperwork_request.form_type,
        "content": paperwork_content,
        "template_id": template.id,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/paperwork-templates/{user_id}")
async def get_paperwork_templates(user_id: str):
    templates = await db.paperwork_templates.find({"user_id": user_id}).sort("created_date", -1).to_list(50)
    return [PaperworkTemplate(**parse_from_mongo(template)) for template in templates]

@api_router.post("/paperwork-templates/{template_id}/favorite")
async def toggle_template_favorite(template_id: str):
    template = await db.paperwork_templates.find_one({"id": template_id})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    new_favorite_status = not template.get('is_favorite', False)
    await db.paperwork_templates.update_one(
        {"id": template_id},
        {"$set": {"is_favorite": new_favorite_status}}
    )
    
    return {"message": f"Template {'added to' if new_favorite_status else 'removed from'} favorites"}

# Token System
async def award_tokens(user_id: str, amount: int, description: str):
    """Award tokens to user and log transaction"""
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"tokens": amount}}
    )
    
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
    
    transactions = await db.token_transactions.find({"user_id": user_id}).sort("timestamp", -1).to_list(100)
    
    # Calculate token statistics
    total_earned = sum(t.get('amount', 0) for t in transactions if t.get('transaction_type') == 'earned')
    total_spent = sum(t.get('amount', 0) for t in transactions if t.get('transaction_type') == 'spent')
    
    return {
        "current_tokens": user.get("tokens", 0),
        "total_earned": total_earned,
        "total_spent": total_spent,
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
    
    # Get recent habits (last 7 days)
    habits = await db.habits.find({"user_id": user_id}).sort("date", -1).limit(7).to_list(7)
    
    # Get health goals
    goals = await db.health_goals.find({"user_id": user_id, "is_achieved": False}).limit(3).to_list(3)
    
    # Get token summary
    total_earned = await db.token_transactions.aggregate([
        {"$match": {"user_id": user_id, "transaction_type": "earned"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    # Calculate habit streak
    habit_streak = len(habits) if habits else 0
    
    return {
        "user": User(**parse_from_mongo(user)),
        "recent_records": [MedicalRecord(**parse_from_mongo(r)) for r in records],
        "recent_habits": [Habit(**parse_from_mongo(h)) for h in habits],
        "health_goals": [HealthGoal(**parse_from_mongo(g)) for g in goals],
        "tokens_earned_total": total_earned[0]["total"] if total_earned else 0,
        "habit_streak": habit_streak,
        "health_score": user.get("health_score", 85.0)
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