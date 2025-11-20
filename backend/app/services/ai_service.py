from typing import List, Tuple, Optional, Dict, Any
import os
import asyncio
import httpx
from app.utils import deid as deid_utils
from app.utils import embeddings as embed_utils
from app.db.firebase_utils import get_firestore_client

import logging

log = logging.getLogger(__name__)

# Load settings first (this loads .env file)
try:
    from app.core.config import settings
except Exception:
    settings = None

# Groq AI integration - load after settings to get .env variables
groq_client = None
groq_initialization_error = None
try:
    from groq import Groq
    # Try environment variable first, then settings (which loads .env)
    groq_api_key = os.getenv("GROQ_API_KEY") or (getattr(settings, "GROQ_API_KEY", None) if settings is not None else None) or ""
    
    if not groq_api_key or groq_api_key == "your_groq_api_key_here":
        groq_initialization_error = "Groq API key not configured"
        log.warning("⚠️  GROQ_API_KEY not found or is placeholder value")
        log.info("ℹ️  AI bot will use template-based responses (limited functionality)")
        log.info("ℹ️  To enable Groq AI: Set GROQ_API_KEY environment variable")
        log.info("ℹ️  Get your free API key at: https://console.groq.com/keys")
    else:
        groq_client = Groq(api_key=groq_api_key)
        log.info("✅ Groq AI initialized successfully with Llama 3.3-70b")
        log.info("ℹ️  AI bot will provide high-quality AI-powered responses")
except ImportError as e:
    groq_initialization_error = f"Groq library not installed: {e}"
    log.error(f"❌ Failed to import Groq library: {e}")
    log.info("ℹ️  Install with: pip install groq")
except Exception as e:
    groq_initialization_error = f"Groq initialization failed: {str(e)}"
    log.error(f"❌ Failed to initialize Groq: {e}")
    log.info("ℹ️  AI bot will use template-based responses")

# Hugging Face Inference API Configuration
# Updated to new Inference Providers API (November 2025)
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY") or (getattr(settings, "HUGGINGFACE_API_KEY", None) if settings is not None else None) or ""
HF_API_BASE = "https://router.huggingface.co/hf-inference/models"

# Model endpoints
# Using publicly accessible models on HF Inference API
# Note: Many medical models (MedAlpaca, some BioBERT variants) aren't on free Inference API
# Using GPT-2 as fallback - always available, works reliably
# TODO: Test and switch to medical models if they become available or with paid tier
MODELS = {
    "biobert": "gpt2",  # GPT-2 with medical prompts
    "clinicalbert": "gpt2",  # GPT-2 with clinical prompts  
    "medalpaca": "gpt2",  # GPT-2 for conversation (fallback)
    "biogpt": "gpt2",  # GPT-2 for general medical text
}


async def query_huggingface_model(
    model_name: str, 
    input_text: str, 
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Query Hugging Face Inference API.
    
    Args:
        model_name: Name of the model (e.g., 'biobert', 'medalpaca')
        input_text: Input text to process
        parameters: Optional parameters for the model
    
    Returns:
        Dict with model, input, output, and confidence
    """
    if not HF_API_KEY:
        log.warning("HUGGINGFACE_API_KEY not set. Using fallback response.")
        return {
            "model": model_name,
            "input": input_text,
            "output": "API key not configured. Please set HUGGINGFACE_API_KEY environment variable.",
            "confidence": 0.0
        }
    
    # Get model endpoint
    model_id = MODELS.get(model_name, MODELS["biogpt"])
    url = f"{HF_API_BASE}/{model_id}"
    
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Prepare payload
    payload = {"inputs": input_text}
    if parameters:
        payload["parameters"] = parameters
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code == 503:
                # Model is loading, wait and retry once
                log.info(f"Model {model_id} is loading, waiting 20s...")
                await asyncio.sleep(20)
                response = await client.post(url, json=payload, headers=headers)
            
            response.raise_for_status()
            result = response.json()
            
            # Parse response based on model type
            output_text = ""
            confidence = 0.8
            
            if isinstance(result, list) and len(result) > 0:
                # Text generation models return list
                if "generated_text" in result[0]:
                    output_text = result[0]["generated_text"]
                elif "label" in result[0]:
                    # Classification models
                    output_text = f"Classification: {result[0]['label']}"
                    confidence = result[0].get('score', 0.8)
                else:
                    output_text = str(result[0])
            elif isinstance(result, dict):
                output_text = result.get("generated_text", str(result))
            else:
                output_text = str(result)
            
            return {
                "model": model_id,
                "input": input_text,
                "output": output_text,
                "confidence": float(confidence)
            }
            
    except httpx.HTTPStatusError as e:
        log.error(f"HTTP error calling {model_id}: {e}")
        return {
            "model": model_id,
            "input": input_text,
            "output": f"Error: {e.response.status_code} - {e.response.text}",
            "confidence": 0.0
        }
    except Exception as e:
        log.error(f"Error calling Hugging Face API: {e}")
        return {
            "model": model_id,
            "input": input_text,
            "output": f"Error processing request: {str(e)}",
            "confidence": 0.0
        }


async def query_biobert(text: str) -> Dict[str, Any]:
    """Query BioBERT for question answering and symptom understanding."""
    prompt = f"Question: {text}\nAnswer:"
    return await query_huggingface_model(
        "biobert",
        prompt,
        parameters={"max_length": 200, "temperature": 0.7}
    )


async def query_clinicalbert(text: str) -> Dict[str, Any]:
    """Query ClinicalBERT for medical text classification."""
    return await query_huggingface_model(
        "clinicalbert",
        text,
        parameters={"max_length": 150}
    )


async def query_medalpaca(text: str) -> Dict[str, Any]:
    """Query AI for conversational medical advice. Tries Groq first, then templates."""
    
    # Try Groq/Llama 3.1 first (best quality)
    if groq_client:
        try:
            log.info("🤖 Using Groq Llama 3.1 for response")
            prompt = f"A patient says: {text}\n\nProvide helpful medical guidance:"
            return await query_groq_llama(prompt)
        except Exception as e:
            log.warning(f"Groq failed, falling back to templates: {e}")
    
    # Fallback to template system (always works)
    log.info("📋 Using template-based response")
    return _generate_template_response(text)


async def query_biogpt(text: str) -> Dict[str, Any]:
    """Query BioGPT for disease prediction and general medical text generation."""
    return await query_huggingface_model(
        "biogpt",
        text,
        parameters={"max_length": 200, "temperature": 0.7}
    )


async def query_groq_llama(prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
    """Query Groq's Llama 3.3 70B model for intelligent medical responses."""
    if not groq_client:
        error_msg = groq_initialization_error or "Groq client not initialized"
        log.warning(f"Groq not available: {error_msg}")
        raise Exception(f"Groq AI unavailable: {error_msg}")
    
    if system_prompt is None:
        system_prompt = (
            "You are a helpful medical AI assistant. Provide clear, evidence-based health information. "
            "Always remind users to consult healthcare professionals for serious concerns or emergencies. "
            "Be empathetic and professional. Keep responses concise but informative."
        )
    
    try:
        log.debug(f"Querying Groq with prompt length: {len(prompt)}")
        # Updated to use llama-3.3-70b-versatile (latest stable model)
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
            top_p=0.9
        )
        
        output_text = response.choices[0].message.content
        log.info(f"✅ Groq response received (length: {len(output_text)})")
        
        return {
            "model": "Llama 3.3 70B (Groq)",
            "input": prompt,
            "output": output_text,
            "confidence": 0.9  # High confidence for Groq/Llama
        }
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        
        # Check for specific error types
        if "authentication" in error_msg.lower() or "api key" in error_msg.lower() or "401" in error_msg:
            log.error(f"❌ Groq Authentication Error: Invalid API key")
            log.error(f"ℹ️  Please verify GROQ_API_KEY is set correctly in environment variables")
            raise Exception("Groq authentication failed - check API key")
        elif "rate limit" in error_msg.lower() or "429" in error_msg:
            log.error(f"❌ Groq Rate Limit: Too many requests")
            log.error(f"ℹ️  Free tier: 14,400 requests/day. Consider upgrading or waiting.")
            raise Exception("Groq rate limit exceeded")
        elif "timeout" in error_msg.lower() or "connection" in error_msg.lower():
            log.error(f"❌ Groq Network Error: {error_msg}")
            raise Exception(f"Groq network error: {error_msg}")
        else:
            log.error(f"❌ Groq API error ({error_type}): {error_msg}")
            raise Exception(f"Groq API error: {error_msg}")


def _generate_template_response(text: str) -> Dict[str, Any]:
    """Generate intelligent template-based medical response when AI API is unavailable."""
    lower_text = text.lower()
    
    # Common symptom keywords and responses (with variations/typos)
    symptom_keywords = {
        "fever": ["fever", "temperature", "hot", "burning up"],
        "headache": ["headache", "head ache", "head hurt", "head pain", "migraine", "head aching", "head is aching", "my head", "head and"],
        "cough": ["cough", "coughing", "hacking"],
        "chest pain": ["chest pain", "chest hurt", "chest pressure", "chest aching"],
        "shortness of breath": ["shortness of breath", "short of breath", "can't breathe", "difficulty breathing", "hard to breathe"],
        "stomach pain": ["stomach pain", "stomach ache", "stomach hurt", "abdominal pain", "belly hurt", "tummy ache", "stomach aching", "stomach is aching"],
        "nausea": ["nausea", "nauseous", "feel sick", "queasy", "vomit", "throw up"],
        "dizziness": ["dizzy", "dizziness", "dizling", "lightheaded", "vertigo", "spinning"],
    }
    
    responses = {
        "fever": "Fever is commonly caused by infections (viral or bacterial). For adults, a fever above 103°F (39.4°C) or lasting more than 3 days should be evaluated by a healthcare provider. Stay hydrated, rest, and consider over-the-counter fever reducers like acetaminophen or ibuprofen. If you experience difficulty breathing, chest pain, severe headache, or confusion, seek immediate medical attention.",
        
        "headache": "Headaches can have many causes, from tension and stress to dehydration or sinus issues. Most headaches are not serious, but seek immediate medical care if you experience sudden severe headache, headache with fever/stiff neck, confusion, vision changes, or headache after head injury. Try resting in a quiet dark room, staying hydrated, and using over-the-counter pain relievers.",
        
        "cough": "Coughs can be caused by viral infections, allergies, or irritants. Most coughs resolve within 2-3 weeks. See a doctor if your cough lasts more than 3 weeks, produces blood, or is accompanied by high fever, difficulty breathing, or chest pain. Stay hydrated and consider honey or cough drops for symptom relief.",
        
        "chest pain": "⚠️ IMPORTANT: Chest pain can be a sign of a serious condition. If you're experiencing severe chest pain, pressure, pain radiating to arm/jaw/back, shortness of breath, or sweating, call emergency services immediately. Even if symptoms are mild, chest pain should be evaluated by a healthcare provider promptly.",
        
        "shortness of breath": "⚠️ URGENT: Difficulty breathing or shortness of breath requires immediate medical attention. Call emergency services if you experience severe breathing difficulty, chest pain, blue lips/face, or confusion. This could indicate serious conditions like asthma, heart problems, or respiratory infections.",
        
        "stomach pain": "Abdominal pain has many possible causes, from indigestion to more serious conditions. Seek medical care if you have severe pain, pain that worsens, fever, vomiting, or inability to have bowel movements. Mild stomach pain may improve with rest and avoiding irritating foods.",
        
        "nausea": "Nausea can be caused by viral infections, food poisoning, medication side effects, or other conditions. Stay hydrated with small sips of clear fluids. See a doctor if nausea persists for more than 24 hours, you can't keep fluids down, or if you have severe abdominal pain or signs of dehydration.",
        
        "dizziness": "Dizziness can result from inner ear problems, dehydration, low blood sugar, or other causes. Sit or lie down immediately if you feel dizzy. Seek medical attention if dizziness is severe, persistent, or accompanied by chest pain, headache, shortness of breath, or fainting.",
    }
    
    # Check for emergency keywords
    emergency_keywords = ["chest pain", "shortness of breath", "difficulty breathing", "unconscious", "severe bleeding", "suicidal"]
    is_emergency = any(keyword in lower_text for keyword in emergency_keywords)
    
    # Find ALL matching symptoms
    matched_symptoms = []
    for symptom, keywords in symptom_keywords.items():
        if any(keyword in lower_text for keyword in keywords):
            matched_symptoms.append(symptom)
    
    # Build response based on matched symptoms
    response_text = None
    if len(matched_symptoms) > 1:
        # Multiple symptoms - provide combined advice
        symptom_list = ", ".join(matched_symptoms)
        response_parts = [f"You mentioned experiencing {symptom_list}. Here's some guidance:\n"]
        for symptom in matched_symptoms[:3]:  # Limit to 3 symptoms
            response_parts.append(f"\n**{symptom.title()}:** {responses[symptom][:200]}...")
        response_parts.append("\n\n⚠️ Since you're experiencing multiple symptoms, it's advisable to consult with a healthcare provider for a proper evaluation.")
        response_text = "".join(response_parts)
    elif len(matched_symptoms) == 1:
        # Single symptom
        response_text = responses[matched_symptoms[0]]
    
    # Default response if no keywords match
    if not response_text:
        response_text = (
            "Thank you for sharing your health concerns. Based on the information provided, I recommend:\n\n"
            "1. Monitor your symptoms and track any changes\n"
            "2. Stay well-hydrated and get adequate rest\n"
            "3. Consult with a healthcare provider if symptoms worsen or persist\n\n"
            "⚠️ Note: This is general health information. For personalized medical advice, please consult a qualified healthcare professional. "
            "If you're experiencing severe symptoms or a medical emergency, call emergency services immediately."
        )
    
    # Calculate confidence based on match quality
    if len(matched_symptoms) >= 2:
        confidence = 0.85  # High confidence for multiple recognized symptoms
    elif len(matched_symptoms) == 1:
        confidence = 0.75  # Good confidence for single symptom
    else:
        confidence = 0.5   # Lower confidence for generic response
    
    return {
        "model": "MedAI Template System",
        "input": text,
        "output": response_text,
        "confidence": confidence
    }


async def process_chat(message: str, triage: Optional[dict] = None, consultation_id: Optional[str] = None) -> dict:
    """Main pipeline for handling a chat message.

    Steps:
    - de-identify message + triage
    - compute embeddings (if available)
    - generate response via HF model (if available)
    - determine whether to recommend doctor (heuristic)
    - persist de-identified record to Firestore (best-effort)
    """
    # build a text context
    triage_text = "" if not triage else " | ".join(f"{k}: {v}" for k, v in triage.items() if v)
    combined = f"Triage: {triage_text}\nMessage: {message}"

    deid_text = deid_utils.deidentify(combined)

    embedding = embed_utils.embed(deid_text)

    # Use MedAlpaca for conversational medical advice
    ai_response = await query_medalpaca(deid_text)
    response_text = ai_response["output"]
    confidence = ai_response["confidence"]

    # simple heuristics to flag doctor recommendation
    recommend_doctor = False
    red_flags = ["severe", "chest pain", "shortness of breath", "unconscious", "bleeding heavily", "suicidal"]
    lower = (message or "").lower()
    if any(flag in lower for flag in red_flags) or (confidence < 0.35):
        recommend_doctor = True

    # persist to firestore (best-effort)
    try:
        client = get_firestore_client()
        if client:
            doc = {
                "consultation_id": consultation_id,
                "deidentified_text": deid_text,
                "raw_message": None,  # don't store raw PII
                "response": response_text,
                "confidence": float(confidence),
                "recommend_doctor": bool(recommend_doctor),
            }
            client.collection("consultations").add(doc)
    except Exception as e:
        log.debug("Failed to persist consultation: %s", e)

    return {
        "reply": response_text,
        "confidence": float(confidence),
        "ai_recommend_doctor": bool(recommend_doctor),
        "deidentified_input": deid_text,
        "embedding": embedding,
    }


async def summarize_lab_text(parsed_text: str) -> dict:
    """Run de-id, optional NER, then generate a plain-language summary of lab findings."""
    deid_text = deid_utils.deidentify(parsed_text)
    
    #attempt to extract medications/entities using med7 if available
    entities = []
    try:
        import spacy
        try:
            nlp = spacy.load("en_core_med7_lg")
        except Exception:
            nlp = None
        if nlp:
            doc = nlp(deid_text)
            for ent in doc.ents:
                entities.append({"text": ent.text, "label": ent.label_})
    except ImportError:
        # spaCy not installed - skip NER extraction
        log.debug("spaCy not available, skipping entity extraction")
        entities = []
    except Exception as e:
        log.debug(f"Entity extraction failed: {e}")
        entities = []


    # Try Groq first for lab interpretation, then fall back to templates
    try:
        if groq_client:
            log.info("🤖 Using Groq for lab interpretation")
            prompt = f"Analyze these lab results and provide a clear, concise interpretation:\n\n{deid_text}\n\nFocus on: what's normal, what's abnormal, and what it might mean."
            ai_response = await query_groq_llama(
                prompt,
                system_prompt="You are a medical AI assistant specializing in lab result interpretation. Provide clear, evidence-based analysis. Always recommend consulting a healthcare provider."
            )
            summary = ai_response["output"]
            confidence = ai_response["confidence"]
        else:
            # Use template interpretation
            summary, confidence = _interpret_lab_results(parsed_text, deid_text)
    except Exception as e:
        log.warning(f"Groq failed for lab analysis, using template: {e}")
        summary, confidence = _interpret_lab_results(parsed_text, deid_text)

    # persist lab analysis
    try:
        client = get_firestore_client()
        if client:
            client.collection("lab_reports").add({
                "deidentified_text": deid_text,
                "summary": summary,
                "entities": entities,
            })
    except Exception:
        pass

    return {"parsed_text": deid_text, "summary": summary, "entities": entities, "confidence": float(confidence)}


def _interpret_lab_results(original_text: str, deid_text: str) -> tuple[str, float]:
    """Interpret lab results with intelligent pattern matching."""
    lower_text = original_text.lower()
    
    # Common lab tests and their normal ranges
    lab_patterns = {
        # Blood Sugar
        "glucose": {"keywords": ["glucose", "sugar", "blood sugar"], "normal": (70, 100), "unit": "mg/dL"},
        "hba1c": {"keywords": ["hba1c", "a1c", "hemoglobin a1c"], "normal": (4.0, 5.6), "unit": "%"},
        
        # Lipid Panel
        "cholesterol": {"keywords": ["cholesterol", "total cholesterol"], "normal": (0, 200), "unit": "mg/dL"},
        "ldl": {"keywords": ["ldl", "bad cholesterol"], "normal": (0, 100), "unit": "mg/dL"},
        "hdl": {"keywords": ["hdl", "good cholesterol"], "normal": (40, 999), "unit": "mg/dL"},
        "triglycerides": {"keywords": ["triglycerides", "trig"], "normal": (0, 150), "unit": "mg/dL"},
        
        # Kidney Function
        "creatinine": {"keywords": ["creatinine", "creat"], "normal": (0.7, 1.3), "unit": "mg/dL"},
        "bun": {"keywords": ["bun", "blood urea nitrogen"], "normal": (7, 20), "unit": "mg/dL"},
        
        # Liver Function
        "alt": {"keywords": ["alt", "sgpt"], "normal": (7, 56), "unit": "U/L"},
        "ast": {"keywords": ["ast", "sgot"], "normal": (10, 40), "unit": "U/L"},
        
        # Blood Count
        "hemoglobin": {"keywords": ["hemoglobin", "hgb", "hb"], "normal": (12, 17), "unit": "g/dL"},
        "wbc": {"keywords": ["wbc", "white blood cell", "leukocyte"], "normal": (4000, 11000), "unit": "cells/µL"},
        "platelets": {"keywords": ["platelet", "plt"], "normal": (150000, 400000), "unit": "cells/µL"},
    }
    
    findings = []
    abnormal_count = 0
    
    # Extract numbers and analyze
    import re
    for test_name, test_info in lab_patterns.items():
        for keyword in test_info["keywords"]:
            if keyword in lower_text:
                # Try to find a number near this keyword
                pattern = rf"{keyword}[:\s]*(\d+\.?\d*)"
                match = re.search(pattern, lower_text, re.IGNORECASE)
                if match:
                    value = float(match.group(1))
                    min_val, max_val = test_info["normal"]
                    unit = test_info["unit"]
                    
                    if value < min_val:
                        findings.append(f"• **{test_name.upper()}**: {value} {unit} - **Low** (Normal: {min_val}-{max_val} {unit})")
                        abnormal_count += 1
                    elif value > max_val:
                        findings.append(f"• **{test_name.upper()}**: {value} {unit} - **High** (Normal: {min_val}-{max_val} {unit})")
                        abnormal_count += 1
                    else:
                        findings.append(f"• **{test_name.upper()}**: {value} {unit} - Normal ✓")
                    break
    
    # Generate summary based on findings
    if findings:
        summary_parts = ["**Lab Results Interpretation:**\n"]
        summary_parts.extend(findings)
        
        if abnormal_count > 0:
            summary_parts.append(f"\n⚠️ **{abnormal_count} abnormal result(s) detected.** Please consult with your healthcare provider to discuss these findings and determine if any follow-up is needed.")
        else:
            summary_parts.append("\n✅ **All detected values are within normal ranges.** Continue maintaining a healthy lifestyle and follow your doctor's recommendations.")
        
        summary_parts.append("\n📋 **Important Note:** This is a preliminary interpretation. Lab results should always be reviewed by a qualified healthcare professional who can consider your complete medical history.")
        
        confidence = 0.8 if abnormal_count > 0 else 0.85
        return ("\n".join(summary_parts), confidence)
    
    # Generic response if no specific tests detected
    generic_summary = (
        "**Lab Results Received**\n\n"
        "Your lab report has been processed. While I can recognize some common tests, "
        "a complete interpretation requires review by your healthcare provider.\n\n"
        "**General Recommendations:**\n"
        "• Schedule a follow-up appointment with your doctor to discuss these results\n"
        "• Bring any questions or concerns you have about the findings\n"
        "• Ask about any values that are flagged as high or low\n"
        "• Discuss what lifestyle changes or treatments may be recommended\n\n"
        "⚠️ **Note:** Lab results are most meaningful when reviewed in the context of your "
        "overall health, symptoms, and medical history by a qualified healthcare professional."
    )
    
    return (generic_summary, 0.6)

