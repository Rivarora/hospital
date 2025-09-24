# AI Services for Hackathon Features
import json
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os

logger = logging.getLogger(__name__)
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

class AIHealthAssistant:
    """AI-powered health assistant for real-time consultations"""
    
    @staticmethod
    async def get_health_consultation(user_data: Dict, message: str, session_context: List[Dict] = None) -> Dict[str, Any]:
        """Get AI health consultation response"""
        try:
            # Build context from user's health data
            context = AIHealthAssistant._build_user_context(user_data)
            
            # Add session history if available
            if session_context:
                context += "\n\nConversation History:\n"
                for msg in session_context[-5:]:  # Last 5 messages for context
                    context += f"{msg['message_type']}: {msg['content']}\n"
            
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"health_assistant_{user_data.get('id', 'unknown')}",
                system_message="""You are Dr. HealthSync, an expert AI health assistant. You provide:

1. PERSONALIZED health advice based on user data
2. EVIDENCE-BASED medical information  
3. ACTIONABLE recommendations
4. EMERGENCY recognition (when to seek immediate care)
5. SUPPORTIVE and empathetic responses

ALWAYS:
- Start responses with a personalized greeting using their health context
- Provide specific, actionable advice
- Include relevant health metrics/goals
- Recommend when to consult healthcare professionals
- Be encouraging and supportive

NEVER:
- Provide specific medical diagnoses
- Recommend prescription medications
- Replace professional medical advice
- Give advice outside your competence

Format responses as friendly, conversational advice with clear action items."""
            ).with_model("openai", "gpt-4o")
            
            user_message = UserMessage(
                text=f"User Context: {context}\n\nUser Question: {message}\n\nProvide personalized health advice considering their current health status, habits, and goals."
            )
            
            response = await chat.send_message(user_message)
            
            # Analyze response for urgency/emergency keywords
            urgency_level = AIHealthAssistant._analyze_urgency(message, response)
            
            return {
                "response": response,
                "urgency_level": urgency_level,
                "recommendations": AIHealthAssistant._extract_recommendations(response),
                "follow_up_suggested": "doctor" in response.lower() or "medical" in response.lower()
            }
            
        except Exception as e:
            logger.error(f"AI consultation error: {e}")
            return {
                "response": "I'm experiencing technical difficulties right now. For urgent health concerns, please contact your healthcare provider or emergency services immediately.",
                "urgency_level": "medium",
                "recommendations": ["Contact healthcare provider", "Monitor symptoms"],
                "follow_up_suggested": True
            }
    
    @staticmethod
    def _build_user_context(user_data: Dict) -> str:
        """Build comprehensive user context for AI"""
        context = f"""
Patient Profile:
- Name: {user_data.get('name', 'User')}
- Age: {user_data.get('age', 'Not specified')}
- Health Score: {user_data.get('health_score', 85)}/100
- Total Tokens Earned: {user_data.get('tokens', 0)}

Recent Health Habits (if available):
{AIHealthAssistant._format_recent_habits(user_data.get('recent_habits', []))}

Recent Medical Records:
{AIHealthAssistant._format_medical_records(user_data.get('recent_records', []))}

Health Goals:
{AIHealthAssistant._format_health_goals(user_data.get('health_goals', []))}
        """
        return context.strip()
    
    @staticmethod
    def _format_recent_habits(habits: List) -> str:
        if not habits:
            return "- No recent habit data available"
        
        formatted = []
        for habit in habits[:3]:  # Last 3 habits
            formatted.append(f"- {habit.get('date', 'Recent')}: Sleep {habit.get('sleep_hours', 'N/A')}h, Exercise {habit.get('exercise_minutes', 'N/A')}min, Mood {habit.get('mood_rating', 'N/A')}/5")
        return "\n".join(formatted)
    
    @staticmethod
    def _format_medical_records(records: List) -> str:
        if not records:
            return "- No recent medical records"
        
        formatted = []
        for record in records[:2]:  # Last 2 records
            formatted.append(f"- {record.get('filename', 'Medical Record')}: {record.get('ai_summary', 'No summary available')[:100]}...")
        return "\n".join(formatted)
    
    @staticmethod
    def _format_health_goals(goals: List) -> str:
        if not goals:
            return "- No specific health goals set"
        
        formatted = []
        for goal in goals[:3]:  # Top 3 goals
            formatted.append(f"- {goal.get('goal_type', 'Health Goal')}: Target {goal.get('target_value', 'N/A')} {goal.get('unit', '')}")
        return "\n".join(formatted)
    
    @staticmethod
    def _analyze_urgency(message: str, response: str) -> str:
        """Analyze message and response for urgency level"""
        emergency_keywords = ["emergency", "urgent", "severe", "critical", "immediately", "hospital", "911", "chest pain", "breathing", "unconscious"]
        high_keywords = ["pain", "fever", "bleeding", "dizzy", "nausea", "doctor"]
        
        text_to_check = (message + " " + response).lower()
        
        if any(keyword in text_to_check for keyword in emergency_keywords):
            return "emergency"
        elif any(keyword in text_to_check for keyword in high_keywords):
            return "high"
        else:
            return "medium"
    
    @staticmethod
    def _extract_recommendations(response: str) -> List[str]:
        """Extract actionable recommendations from AI response"""
        # Simple keyword-based extraction (can be enhanced with NLP)
        recommendations = []
        
        if "drink" in response.lower() and "water" in response.lower():
            recommendations.append("Increase water intake")
        if "exercise" in response.lower():
            recommendations.append("Regular physical activity")
        if "sleep" in response.lower():
            recommendations.append("Improve sleep habits")
        if "doctor" in response.lower() or "medical" in response.lower():
            recommendations.append("Consult healthcare provider")
        if "medication" in response.lower():
            recommendations.append("Review medication schedule")
            
        return recommendations[:3]  # Top 3 recommendations

class PredictiveHealthAnalytics:
    """AI-powered predictive health analytics"""
    
    @staticmethod
    async def analyze_health_trends(user_data: Dict, habits_data: List, records_data: List) -> Dict[str, Any]:
        """Comprehensive health trend analysis and risk prediction"""
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"health_prediction_{user_data.get('id', 'unknown')}",
                system_message="""You are an expert AI health analyst specializing in predictive analytics. Analyze user health data to:

1. IDENTIFY health trends and patterns
2. PREDICT potential health risks
3. CALCULATE risk percentages with confidence levels
4. PROVIDE specific preventive recommendations
5. SUGGEST optimal health goals

Return analysis as JSON with:
- overall_health_score: 0-100
- risk_predictions: [{"condition": "name", "risk_level": "low/medium/high", "risk_percentage": 0-100, "confidence": 0-100, "factors": [], "timeline": "months"}]
- trend_analysis: {"improving": [], "declining": [], "stable": []}
- recommendations: []
- predicted_outcomes: []

Be scientific, accurate, and actionable."""
            ).with_model("openai", "gpt-4o")
            
            # Prepare comprehensive data
            analysis_data = {
                "user_profile": user_data,
                "habit_trends": PredictiveHealthAnalytics._analyze_habit_trends(habits_data),
                "medical_history": [{"summary": r.get("ai_summary", ""), "risk_assessment": r.get("risk_assessment", "")} for r in records_data],
                "current_metrics": PredictiveHealthAnalytics._calculate_current_metrics(habits_data)
            }
            
            user_message = UserMessage(
                text=f"""Analyze this comprehensive health data for predictive insights:

{json.dumps(analysis_data, indent=2)}

Provide detailed health predictions, risk analysis, and actionable recommendations in JSON format."""
            )
            
            response = await chat.send_message(user_message)
            
            try:
                prediction_data = json.loads(response)
            except json.JSONDecodeError:
                # Fallback structured response
                prediction_data = PredictiveHealthAnalytics._create_fallback_analysis(user_data, habits_data)
            
            return prediction_data
            
        except Exception as e:
            logger.error(f"Predictive analysis error: {e}")
            return PredictiveHealthAnalytics._create_fallback_analysis(user_data, habits_data)
    
    @staticmethod
    def _analyze_habit_trends(habits_data: List) -> Dict[str, Any]:
        """Analyze trends in user habits"""
        if not habits_data:
            return {"trends": "insufficient_data"}
        
        trends = {}
        metrics = ["sleep_hours", "exercise_minutes", "mood_rating", "stress_level", "water_glasses"]
        
        for metric in metrics:
            values = [h.get(metric) for h in habits_data if h.get(metric) is not None]
            if len(values) >= 3:
                # Simple trend analysis
                recent_avg = sum(values[-3:]) / 3 if len(values) >= 3 else sum(values) / len(values)
                older_avg = sum(values[:-3]) / len(values[:-3]) if len(values) > 3 else recent_avg
                
                if recent_avg > older_avg * 1.1:
                    trend = "improving"
                elif recent_avg < older_avg * 0.9:
                    trend = "declining"
                else:
                    trend = "stable"
                
                trends[metric] = {
                    "trend": trend,
                    "recent_average": recent_avg,
                    "change_percentage": ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
                }
        
        return trends
    
    @staticmethod
    def _calculate_current_metrics(habits_data: List) -> Dict[str, float]:
        """Calculate current health metrics from recent habits"""
        if not habits_data:
            return {}
        
        recent_habits = habits_data[-7:]  # Last week
        metrics = {}
        
        for metric in ["sleep_hours", "exercise_minutes", "mood_rating", "stress_level", "water_glasses"]:
            values = [h.get(metric) for h in recent_habits if h.get(metric) is not None]
            if values:
                metrics[f"avg_{metric}"] = sum(values) / len(values)
        
        return metrics
    
    @staticmethod
    def _create_fallback_analysis(user_data: Dict, habits_data: List) -> Dict[str, Any]:
        """Create fallback analysis when AI fails"""
        health_score = user_data.get("health_score", 85)
        
        # Basic risk assessment based on health score
        if health_score >= 90:
            risk_level = "low"
            risk_percentage = 15
        elif health_score >= 75:
            risk_level = "medium"
            risk_percentage = 35
        else:
            risk_level = "high"
            risk_percentage = 65
        
        return {
            "overall_health_score": health_score,
            "risk_predictions": [
                {
                    "condition": "General Health Decline",
                    "risk_level": risk_level,
                    "risk_percentage": risk_percentage,
                    "confidence": 75,
                    "factors": ["Health score", "Habit consistency"],
                    "timeline": "6-12 months"
                }
            ],
            "trend_analysis": {
                "improving": ["Overall wellness tracking"],
                "declining": [],
                "stable": ["Health score maintenance"]
            },
            "recommendations": [
                "Maintain consistent health habits",
                "Regular health monitoring",
                "Consult healthcare provider annually"
            ],
            "predicted_outcomes": [
                "Continued health improvement with consistent habits"
            ]
        }

class MedicationInteractionChecker:
    """AI-powered medication interaction and safety checker"""
    
    @staticmethod
    async def check_medication_interactions(medications: List[Dict], new_medication: Dict = None) -> Dict[str, Any]:
        """Check for medication interactions and safety warnings"""
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"medication_check_{datetime.now().timestamp()}",
                system_message="""You are an expert pharmaceutical AI assistant. Analyze medication lists for:

1. DRUG INTERACTIONS (major, moderate, minor)
2. SAFETY WARNINGS and contraindications
3. DOSAGE CONCERNS
4. TIMING RECOMMENDATIONS
5. FOOD/LIFESTYLE interactions

Return JSON with:
- interaction_level: "none/minor/moderate/major/severe"
- interactions: [{"drug1": "name", "drug2": "name", "severity": "level", "description": "text", "recommendation": "text"}]
- warnings: []
- recommendations: []
- safe_to_take: boolean

Be extremely cautious and always recommend consulting healthcare providers for medication decisions."""
            ).with_model("openai", "gpt-4o")
            
            medication_list = medications.copy()
            if new_medication:
                medication_list.append(new_medication)
            
            user_message = UserMessage(
                text=f"""Analyze these medications for interactions and safety:

Medications: {json.dumps(medication_list, indent=2)}

Provide comprehensive interaction analysis in JSON format."""
            )
            
            response = await chat.send_message(user_message)
            
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "interaction_level": "unknown",
                    "interactions": [],
                    "warnings": ["Unable to analyze interactions. Consult pharmacist."],
                    "recommendations": ["Verify with healthcare provider"],
                    "safe_to_take": False
                }
                
        except Exception as e:
            logger.error(f"Medication interaction check error: {e}")
            return {
                "interaction_level": "error",
                "interactions": [],
                "warnings": ["System error. Consult healthcare provider immediately."],
                "recommendations": ["Contact pharmacist for interaction check"],
                "safe_to_take": False
            }

class EmergencyDetectionAI:
    """AI system for detecting health emergencies from user data"""
    
    @staticmethod
    async def analyze_for_emergencies(user_data: Dict, recent_inputs: List[Dict]) -> Optional[Dict[str, Any]]:
        """Analyze user data for potential health emergencies"""
        try:
            # Combine all recent data
            analysis_context = {
                "user_profile": user_data,
                "recent_habits": recent_inputs.get("habits", []),
                "recent_messages": recent_inputs.get("chat_messages", []),
                "recent_vitals": recent_inputs.get("vitals", [])
            }
            
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"emergency_detection_{user_data.get('id', 'unknown')}",
                system_message="""You are an emergency health detection AI. Analyze user data for signs of medical emergencies:

DETECT:
- Severe symptom patterns
- Dangerous vital signs
- Emergency keywords in messages
- Sudden health deterioration
- Mental health crises

Return JSON ONLY if emergency detected:
{
  "emergency_detected": true,
  "severity": "high/critical",
  "type": "medical/mental_health/medication",
  "indicators": [],
  "recommended_action": "call_911/urgent_care/doctor",
  "message": "Clear emergency description"
}

Return {"emergency_detected": false} if no emergency."""
            ).with_model("openai", "gpt-4o")
            
            user_message = UserMessage(
                text=f"Analyze for health emergencies: {json.dumps(analysis_context)}"
            )
            
            response = await chat.send_message(user_message)
            
            try:
                result = json.loads(response)
                return result if result.get("emergency_detected") else None
            except json.JSONDecodeError:
                return None
                
        except Exception as e:
            logger.error(f"Emergency detection error: {e}")
            return None