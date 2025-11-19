"""Create a clinician user (Firebase Auth + Firestore docs) for local/dev use.

Usage:
    python create_clinician.py --email mwangian877@gmail.com --password 123456789 --name "Dr Mwangi" --approve

This script is intended for development/testing only. It uses the Firebase
Admin SDK and requires GOOGLE_APPLICATION_CREDENTIALS to be set (or another
method of admin auth). It will create a Firebase Auth user and Firestore
documents under `users/{uid}` and `clinicians/{uid}`.
"""

import argparse
import sys
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import auth, credentials, firestore
except Exception as e:
    print("Firebase Admin SDK is required. Install with: pip install firebase-admin")
    raise


def init_firebase():
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    return firestore.client()


def create_clinician(email, password, name, approve=False, specialization=None, license_number=None):
    db = init_firebase()

    # Create or get the Auth user
    try:
        user = auth.get_user_by_email(email)
        print(f"Found existing auth user: {user.uid}")
    except auth.UserNotFoundError:
        user = auth.create_user(email=email, password=password, display_name=name)
        print(f"Created Firebase Auth user: {user.uid}")

    uid = user.uid

    # Create user doc in 'users' collection
    users_ref = db.collection('users').document(uid)
    users_ref.set({
        'uid': uid,
        'email': email,
        'name': name,
        'role': 'clinician',
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }, merge=True)
    print(f"Created/updated users/{uid} document")

    # Create clinician profile
    clinicians_ref = db.collection('clinicians').document(uid)
    clinicians_doc = {
        'uid': uid,
        'email': email,
        'name': name,
        'specialization': specialization or 'General Medicine',
        'license_number': license_number or '',
        'status': 'approved' if approve else 'pending',
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }
    clinicians_ref.set(clinicians_doc, merge=True)
    print(f"Created/updated clinicians/{uid} document (status={clinicians_doc['status']})")

    print("\nClinician account ready:\n")
    print(f"  Email: {email}")
    print(f"  Password: (the provided password)")
    print(f"  UID: {uid}")
    print("\nYou can now sign in from the frontend using these credentials.")


def main():
    parser = argparse.ArgumentParser(description='Create a clinician account in Firebase (dev only)')
    parser.add_argument('--email', required=True, help='Clinician email')
    parser.add_argument('--password', required=True, help='Password for the Auth user')
    parser.add_argument('--name', default='Doctor', help='Display name')
    parser.add_argument('--approve', action='store_true', help='Mark clinician profile as approved')
    parser.add_argument('--specialization', help='Clinician specialization')
    parser.add_argument('--license', dest='license_number', help='License number')

    args = parser.parse_args()

    try:
        create_clinician(args.email, args.password, args.name, approve=args.approve, specialization=args.specialization, license_number=args.license_number)
    except Exception as e:
        print(f"Error creating clinician: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
