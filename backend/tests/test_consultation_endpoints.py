import pytest
from fastapi.testclient import TestClient

from app.main import app

import app.api.v1.endpoints.history as history_module
from app.core import security


class FakeDoc:
    def __init__(self, id, data):
        self.id = id
        self._data = data

    def get(self):
        return self

    @property
    def exists(self):
        return self._data is not None

    def to_dict(self):
        return self._data


class FakeSubCollection:
    def __init__(self, docs_list):
        # docs_list: list of dicts
        self.docs = docs_list or []

    def order_by(self, *args, **kwargs):
        return self

    def stream(self):
        # return objects with to_dict
        for d in self.docs:
            yield FakeDoc(None, d)


class FakeDocumentRef:
    def __init__(self, id, data, messages=None, notes=None):
        self.id = id
        self._data = data
        self._messages = messages or []
        self._notes = notes or []

    def get(self):
        return FakeDoc(self.id, self._data)

    def collection(self, name):
        if name == 'messages':
            return FakeSubCollection(self._messages)
        if name == 'clinical_notes':
            return FakeSubCollection(self._notes)
        return FakeSubCollection([])


class FakeCollection:
    def __init__(self, docs_map):
        # docs_map: id -> FakeDocumentRef
        self.docs = docs_map

    def document(self, id):
        return self.docs.get(id, FakeDocumentRef(id, None))

    def stream(self):
        for ref in self.docs.values():
            yield FakeDoc(ref.id, ref._data)


class FakeFirestoreClient:
    def __init__(self, consultations_map):
        self._consultations = consultations_map

    def collection(self, name):
        if name == 'consultations':
            return FakeCollection(self._consultations)
        return FakeCollection({})


@pytest.fixture
def client(monkeypatch):
    # build fake consultation data
    import datetime

    consultation_id = 'test-consult'
    consultation_doc = {
        'user_id': 'user-123',
        'last_updated': datetime.datetime.utcnow(),
        'status': 'active',
        'triage_data': {'age': 30},
        'ai_summary': {'summary': 'Test summary', 'generated_at': datetime.datetime.utcnow(), 'recommendations': ['Follow-up']}
    }

    messages = [
        {'role': 'user', 'content': 'I have a headache', 'timestamp': datetime.datetime.utcnow()},
        {'role': 'ai', 'content': 'Take rest', 'timestamp': datetime.datetime.utcnow()},
    ]

    notes = [
        {'clinician_id': 'clin-1', 'note': 'Check blood pressure', 'timestamp': datetime.datetime.utcnow()}
    ]

    fake_doc_ref = FakeDocumentRef(consultation_id, consultation_doc, messages=messages, notes=notes)
    fake_consultations = {consultation_id: fake_doc_ref}
    fake_db = FakeFirestoreClient(fake_consultations)

    # Monkeypatch the get_firestore_client used in history module
    monkeypatch.setattr(history_module, 'get_firestore_client', lambda: fake_db)

    # Provide dependency overrides for auth
    def fake_require_clinician():
        return {'uid': 'clin-1', 'profile': {'role': 'clinician', 'status': 'approved'}}

    def fake_get_current_user():
        return {'uid': 'user-123'}

    app.dependency_overrides[security.require_clinician] = fake_require_clinician
    app.dependency_overrides[security.get_current_user] = fake_get_current_user

    client = TestClient(app)
    yield client

    # cleanup
    app.dependency_overrides.clear()


def test_get_consultation_full_as_clinician(client):
    res = client.get('/api/consultation/test-consult/full')
    assert res.status_code == 200
    data = res.json()
    assert data['consultation_id'] == 'test-consult'
    assert 'consultation' in data
    assert 'messages' in data and isinstance(data['messages'], list)
    assert 'clinical_notes' in data and isinstance(data['clinical_notes'], list)
    assert 'ai_summary' in data and data['ai_summary']['summary'] == 'Test summary'


def test_get_consultation_full_me_owner(client):
    res = client.get('/api/consultation/test-consult/full/me')
    assert res.status_code == 200
    data = res.json()
    assert data['consultation_id'] == 'test-consult'
    assert 'messages' in data and len(data['messages']) == 2
    assert 'ai_summary' in data


def test_get_consultation_full_me_forbidden(monkeypatch):
    # override current_user to a different uid
    def other_user():
        return {'uid': 'other-user'}

    app.dependency_overrides[security.get_current_user] = other_user
    client = TestClient(app)
    res = client.get('/api/consultation/test-consult/full/me')
    assert res.status_code == 403
    app.dependency_overrides.clear()
