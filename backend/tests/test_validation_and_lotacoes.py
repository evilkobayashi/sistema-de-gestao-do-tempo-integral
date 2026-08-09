import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.validation_service import validation_service
from app.models.schemas import LotacaoCreate

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_workload_guard_under_40h():
    lot = LotacaoCreate(
        escola_id=1,
        turno_id=1,
        turma="101",
        oficina_id=1,
        oficineiro_id=99,
        horas_aula=20.0,
        horas_planejamento=5.0,
        dias="Seg, Qua"
    )
    is_valid, msg = validation_service.validate_lotacao(lot, [])
    assert is_valid is True

def test_workload_guard_exceed_40h():
    existing = [
        {"oficineiro_id": 99, "horas_aula": 30.0, "horas_planejamento": 5.0, "turno_id": 1, "dias": "Seg"}
    ]
    lot = LotacaoCreate(
        escola_id=1,
        turno_id=2,
        turma="201",
        oficina_id=1,
        oficineiro_id=99,
        horas_aula=8.0,
        horas_planejamento=2.0,  # 35 + 10 = 45h -> Exceeds 40h
        dias="Ter"
    )
    is_valid, msg = validation_service.validate_lotacao(lot, existing)
    assert is_valid is False
    assert "Excesso de carga horária" in msg

def test_shift_conflict_guard():
    existing = [
        {"oficineiro_id": 99, "horas_aula": 10.0, "horas_planejamento": 2.0, "turno_id": 1, "dias": "Seg, Qua"}
    ]
    lot = LotacaoCreate(
        escola_id=2,
        turno_id=1, # Same shift (Manhã)
        turma="301",
        oficina_id=2,
        oficineiro_id=99,
        horas_aula=5.0,
        horas_planejamento=1.0,
        dias="Qua, Sex" # Overlaps on Qua
    )
    is_valid, msg = validation_service.validate_lotacao(lot, existing)
    assert is_valid is False
    assert "Conflito de horário" in msg

def test_list_lotacoes_endpoint():
    response = client.get("/lotacoes")
    assert response.status_code == 200
    assert len(response.json()) >= 2

def test_analytics_kpis_endpoint():
    response = client.get("/analytics/dashboard-kpis")
    assert response.status_code == 200
    data = response.json()
    assert "active_escolas" in data
    assert "teachers_workload" in data
