"""
Database Setup Script for MedAI

This script initializes the Firestore database with the required collections,
indexes, and optionally creates sample data for testing.

Usage:
    python database_setup.py --init          # Initialize collections
    python database_setup.py --sample        # Create sample data
    python database_setup.py --all           # Do both
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import argparse
import sys


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
        return firestore.client()
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        sys.exit(1)


def create_collections(db):
    """
    Create all required collections with initial structure.
    Firestore creates collections automatically when first document is added,
    but this ensures they exist with proper structure.
    """
    print("Creating collections...")
    
    collections = {
        'users': {
            'description': 'Patient user accounts',
            'sample_fields': ['uid', 'email', 'name', 'role', 'createdAt']
        },
        'clinicians': {
            'description': 'Clinician/doctor profiles',
            'sample_fields': ['uid', 'email', 'name', 'specialization', 'license_number', 'status']
        },
        'consultations': {
            'description': 'AI consultation sessions',
            'sample_fields': ['user_id', 'status', 'triage_data', 'created_at', 'last_updated']
        },
        'consultation_requests': {
            'description': 'Doctor consultation requests (appointments)',
            'sample_fields': ['user_id', 'clinician_id', 'summary', 'status', 'urgency', 'video_room_id']
        },
        'video_calls': {
            'description': 'Video call sessions',
            'sample_fields': ['room_id', 'consultation_request_id', 'patient_id', 'clinician_id', 'status', 'scheduled_time']
        },
        'lab_reports': {
            'description': 'Uploaded lab reports',
            'sample_fields': ['user_id', 'file_name', 'file_url', 'status', 'uploaded_at']
        }
    }
    
    for collection_name, info in collections.items():
        print(f"  ✓ {collection_name}: {info['description']}")
        print(f"    Fields: {', '.join(info['sample_fields'])}")
    
    print("\nCollections will be created automatically when first documents are added.")
    return True


def create_indexes(db):
    """
    Print index creation commands.
    Note: Firestore indexes must be created via Firebase Console or gcloud CLI.
    """
    print("\n" + "="*80)
    print("REQUIRED FIRESTORE INDEXES")
    print("="*80)
    print("\nCreate these composite indexes in Firebase Console:")
    print("(Firestore Database > Indexes > Create Index)\n")
    
    indexes = [
        {
            'collection': 'users',
            'fields': [
                {'field': 'email', 'order': 'ASCENDING'},
                {'field': 'role', 'order': 'ASCENDING'}
            ]
        },
        {
            'collection': 'consultations',
            'fields': [
                {'field': 'user_id', 'order': 'ASCENDING'},
                {'field': 'last_updated', 'order': 'DESCENDING'}
            ]
        },
        {
            'collection': 'consultation_requests',
            'fields': [
                {'field': 'user_id', 'order': 'ASCENDING'},
                {'field': 'created_at', 'order': 'DESCENDING'}
            ]
        },
        {
            'collection': 'consultation_requests',
            'fields': [
                {'field': 'clinician_id', 'order': 'ASCENDING'},
                {'field': 'status', 'order': 'ASCENDING'}
            ]
        },
        {
            'collection': 'consultation_requests',
            'fields': [
                {'field': 'status', 'order': 'ASCENDING'},
                {'field': 'created_at', 'order': 'DESCENDING'}
            ]
        },
        {
            'collection': 'video_calls',
            'fields': [
                {'field': 'patient_id', 'order': 'ASCENDING'},
                {'field': 'scheduled_time', 'order': 'DESCENDING'}
            ]
        },
        {
            'collection': 'video_calls',
            'fields': [
                {'field': 'clinician_id', 'order': 'ASCENDING'},
                {'field': 'scheduled_time', 'order': 'DESCENDING'}
            ]
        },
        {
            'collection': 'lab_reports',
            'fields': [
                {'field': 'user_id', 'order': 'ASCENDING'},
                {'field': 'uploaded_at', 'order': 'DESCENDING'}
            ]
        }
    ]
    
    for idx, index in enumerate(indexes, 1):
        print(f"{idx}. Collection: {index['collection']}")
        for field in index['fields']:
            print(f"   - {field['field']}: {field['order']}")
        print()
    
    print("\nOr use Firebase CLI:")
    print("firebase deploy --only firestore:indexes")
    print("\nOr gcloud CLI:")
    for index in indexes:
        fields_str = ' '.join([f"--field-config field-path={f['field']},order={f['order'].lower()}" 
                               for f in index['fields']])
        print(f"gcloud firestore indexes composite create --collection-group={index['collection']} {fields_str}")
    
    return True


def create_sample_data(db):
    """Create sample data for testing"""
    print("\n" + "="*80)
    print("CREATING SAMPLE DATA")
    print("="*80)
    
    # Sample patient
    print("\n1. Creating sample patient...")
    patient_ref = db.collection('users').document('sample_patient_001')
    patient_ref.set({
        'uid': 'sample_patient_001',
        'email': 'patient@example.com',
        'name': 'John Doe',
        'role': 'patient',
        'phone': '+1234567890',
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    })
    print("   ✓ Sample patient created: patient@example.com")
    
    # Sample clinician
    print("\n2. Creating sample clinician...")
    clinician_ref = db.collection('clinicians').document('sample_clinician_001')
    clinician_ref.set({
        'uid': 'sample_clinician_001',
        'email': 'doctor@example.com',
        'name': 'Dr. Jane Smith',
        'specialization': 'General Medicine',
        'license_number': 'MD123456',
        'status': 'approved',
        'years_experience': 10,
        'bio': 'Experienced general practitioner',
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    })
    print("   ✓ Sample clinician created: doctor@example.com")
    
    # Sample consultation
    print("\n3. Creating sample consultation...")
    consultation_ref = db.collection('consultations').document('sample_consultation_001')
    consultation_ref.set({
        'user_id': 'sample_patient_001',
        'status': 'active',
        'triage_data': {
            'age': 35,
            'gender': 'male',
            'symptoms': 'Headache and fever',
            'duration': '2 days'
        },
        'created_at': datetime.utcnow(),
        'last_updated': datetime.utcnow()
    })
    
    # Add sample messages
    messages = [
        {
            'role': 'user',
            'content': 'I have been experiencing headaches and fever for 2 days',
            'timestamp': datetime.utcnow()
        },
        {
            'role': 'ai',
            'content': 'I understand you are experiencing headaches and fever. Can you describe the headache? Is it constant or intermittent?',
            'timestamp': datetime.utcnow(),
            'confidence': 0.92,
            'model': 'Groq Llama 3.3'
        }
    ]
    
    for msg in messages:
        consultation_ref.collection('messages').add(msg)
    
    print("   ✓ Sample consultation created with messages")
    
    # Sample consultation request
    print("\n4. Creating sample consultation request...")
    request_ref = db.collection('consultation_requests').document('sample_request_001')
    request_ref.set({
        'user_id': 'sample_patient_001',
        'clinician_id': None,
        'consultation_id': 'sample_consultation_001',
        'summary': 'Persistent headaches and fever',
        'details': 'Symptoms have been ongoing for 2 days. No improvement with over-the-counter medication.',
        'urgency': 'medium',
        'status': 'pending',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    })
    print("   ✓ Sample consultation request created")
    
    # Sample assigned request with video call
    print("\n5. Creating assigned request with video call...")
    assigned_request_ref = db.collection('consultation_requests').document('sample_request_002')
    assigned_request_ref.set({
        'user_id': 'sample_patient_001',
        'clinician_id': 'sample_clinician_001',
        'summary': 'Follow-up consultation',
        'details': 'Need to discuss test results',
        'urgency': 'low',
        'status': 'assigned',
        'video_room_id': 'medai-sample-room-001',
        'video_room_url': 'https://meet.jit.si/medai-sample-room-001',
        'appointment_date': datetime.utcnow() + timedelta(days=1),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    })
    
    # Create corresponding video call
    video_call_ref = db.collection('video_calls').document('sample_call_001')
    video_call_ref.set({
        'room_id': 'medai-sample-room-001',
        'room_url': 'https://meet.jit.si/medai-sample-room-001',
        'consultation_request_id': 'sample_request_002',
        'patient_id': 'sample_patient_001',
        'clinician_id': 'sample_clinician_001',
        'status': 'scheduled',
        'scheduled_time': datetime.utcnow() + timedelta(days=1),
        'patient_joined': False,
        'clinician_joined': False,
        'recording_enabled': False,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    })
    print("   ✓ Sample video call scheduled")
    
    print("\n" + "="*80)
    print("SAMPLE DATA CREATED SUCCESSFULLY")
    print("="*80)
    print("\nTest Credentials:")
    print("  Patient: patient@example.com")
    print("  Doctor:  doctor@example.com")
    print("\nNote: These are sample documents. You'll need to create actual")
    print("Firebase Auth users with these emails to log in.")
    
    return True


def clear_sample_data(db):
    """Clear all sample data"""
    print("\nClearing sample data...")
    
    sample_docs = [
        ('users', 'sample_patient_001'),
        ('clinicians', 'sample_clinician_001'),
        ('consultations', 'sample_consultation_001'),
        ('consultation_requests', 'sample_request_001'),
        ('consultation_requests', 'sample_request_002'),
        ('video_calls', 'sample_call_001')
    ]
    
    for collection, doc_id in sample_docs:
        try:
            db.collection(collection).document(doc_id).delete()
            print(f"  ✓ Deleted {collection}/{doc_id}")
        except Exception as e:
            print(f"  ✗ Failed to delete {collection}/{doc_id}: {e}")
    
    print("Sample data cleared.")


def main():
    parser = argparse.ArgumentParser(description='MedAI Database Setup')
    parser.add_argument('--init', action='store_true', help='Initialize collections and show index commands')
    parser.add_argument('--sample', action='store_true', help='Create sample data')
    parser.add_argument('--clear', action='store_true', help='Clear sample data')
    parser.add_argument('--all', action='store_true', help='Initialize and create sample data')
    
    args = parser.parse_args()
    
    if not any([args.init, args.sample, args.clear, args.all]):
        parser.print_help()
        return
    
    print("="*80)
    print("MedAI DATABASE SETUP")
    print("="*80)
    
    db = initialize_firebase()
    print("✓ Firebase initialized successfully\n")
    
    if args.init or args.all:
        create_collections(db)
        create_indexes(db)
    
    if args.sample or args.all:
        create_sample_data(db)
    
    if args.clear:
        clear_sample_data(db)
    
    print("\n" + "="*80)
    print("SETUP COMPLETE")
    print("="*80)
    print("\nNext steps:")
    print("1. Create the required indexes in Firebase Console")
    print("2. Set up Firebase Authentication users")
    print("3. Configure security rules (see DATABASE_SCHEMA.md)")
    print("4. Start the backend server: uvicorn app.main:app --reload")
    print("5. Start the frontend: npm run dev")


if __name__ == '__main__':
    main()
