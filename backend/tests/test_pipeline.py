import os
import sys
from fastapi.testclient import TestClient

CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, PROJECT_ROOT)

from main import app

client = TestClient(app)


def sample_graph():
    nodes = [
        {"id": "customInput-1", "type": "customInput", "data": {"inputName": "input"}},
        {"id": "text-1", "type": "text", "data": {"text": "{{input}}"}},
        {"id": "llm-1", "type": "llm"},
        {"id": "customOutput-1", "type": "customOutput"},
    ]
    edges = [
        {"id": "e1", "source": "customInput-1", "target": "text-1"},
        {"id": "e2", "source": "text-1", "target": "llm-1"},
        {"id": "e3", "source": "llm-1", "target": "customOutput-1"},
    ]
    return {"nodes": nodes, "edges": edges}


def test_parse_returns_dag_true():
    payload = sample_graph()
    resp = client.post('/pipelines/parse', json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body['num_nodes'] == 4
    assert body['num_edges'] == 3
    assert body['is_dag'] is True


def test_execute_returns_order():
    payload = sample_graph()
    resp = client.post('/pipelines/execute', json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body['status'] == 'queued'
    assert len(body['execution_order']) == 4
    assert body['execution_order'][0]['id'] == 'customInput-1'


def test_execute_rejects_cycles():
    payload = sample_graph()
    payload['edges'].append({"id": "e4", "source": "customOutput-1", "target": "customInput-1"})
    resp = client.post('/pipelines/execute', json=payload)
    assert resp.status_code == 400
    assert 'cycles' in resp.json()['detail']
