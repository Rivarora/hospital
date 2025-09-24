# Extended Models for Hackathon Features
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

# AI Health Assistant Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    message_type: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    context_data: Optional[Dict[str, Any]] = None

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class HealthPrediction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    prediction_type: str  # "cardiovascular", "diabetes", "mental_health", etc.
    risk_level: str  # "low", "medium", "high", "critical"
    risk_percentage: float
    confidence_score: float
    factors: List[str]
    recommendations: List[str]
    predicted_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Health Buddy System
class BuddyRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requester_id: str
    target_id: str
    message: Optional[str] = None
    status: str = "pending"  # "pending", "accepted", "declined"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BuddyPair(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    paired_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    shared_goals: List[str] = []
    total_challenges: int = 0
    active_challenges: int = 0

class BuddyChallenge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    buddy_pair_id: str
    challenge_type: str  # "steps", "exercise", "sleep", "meditation"
    target_value: float
    duration_days: int
    start_date: str
    status: str = "active"  # "active", "completed", "failed"
    user1_progress: float = 0.0
    user2_progress: float = 0.0

# Virtual Doctor Booking
class Doctor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    specialization: str
    years_experience: int
    rating: float
    consultation_fee: float
    available_slots: List[str] = []
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class DoctorAppointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    doctor_id: str
    appointment_datetime: str
    duration_minutes: int = 30
    consultation_type: str  # "general", "followup", "urgent"
    reason: str
    status: str = "scheduled"  # "scheduled", "confirmed", "completed", "cancelled"
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Smart Medication Tracker
class Medication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    dosage: str
    frequency: str  # "daily", "twice_daily", "weekly", etc.
    schedule_times: List[str]  # ["09:00", "21:00"]
    start_date: str
    end_date: Optional[str] = None
    notes: Optional[str] = None
    side_effects: List[str] = []
    interactions: List[str] = []

class MedicationReminder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    medication_id: str
    user_id: str
    reminder_time: str
    status: str = "pending"  # "pending", "taken", "missed", "snoozed"
    taken_at: Optional[datetime] = None
    notes: Optional[str] = None

class MedicationLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    medication_id: str
    scheduled_time: str
    actual_time: Optional[str] = None
    status: str  # "taken", "missed", "late"
    side_effects_noted: List[str] = []
    effectiveness_rating: Optional[int] = None  # 1-5

# Emergency Contacts System
class EmergencyContact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    relationship: str  # "spouse", "parent", "child", "doctor", "friend"
    phone: str
    email: Optional[str] = None
    is_primary: bool = False
    can_receive_alerts: bool = True
    preferred_contact_method: str = "phone"  # "phone", "email", "both"

class HealthAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    alert_type: str  # "emergency", "medication_missed", "health_risk", "goal_achievement"
    severity: str  # "low", "medium", "high", "critical"
    title: str
    message: str
    triggered_by: str  # "ai_analysis", "missed_medication", "manual", etc.
    status: str = "active"  # "active", "acknowledged", "resolved"
    contacts_notified: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Health Analytics & Insights
class HealthInsight(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    insight_type: str  # "trend", "prediction", "recommendation", "warning"
    category: str  # "sleep", "exercise", "nutrition", "mental_health", "overall"
    title: str
    description: str
    data_points: Dict[str, Any]
    confidence_level: float
    priority: str = "medium"  # "low", "medium", "high", "urgent"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

# Request/Response Models
class ChatRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    message: str
    include_health_context: bool = True

class HealthAnalysisRequest(BaseModel):
    user_id: str
    analysis_type: str = "comprehensive"  # "comprehensive", "risk_assessment", "trends"
    time_period: int = 30  # days

class BuddyMatchRequest(BaseModel):
    user_id: str
    preferred_age_range: Optional[List[int]] = None
    preferred_goals: List[str] = []
    max_matches: int = 5

class DoctorSearchRequest(BaseModel):
    specialization: Optional[str] = None
    max_fee: Optional[float] = None
    min_rating: Optional[float] = None
    available_date: Optional[str] = None

class EmergencyAlertRequest(BaseModel):
    user_id: str
    alert_type: str
    severity: str = "high"
    custom_message: Optional[str] = None
    notify_contacts: bool = True