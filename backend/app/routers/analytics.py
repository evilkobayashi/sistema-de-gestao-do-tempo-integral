from fastapi import APIRouter
from app.routers.lotacoes import mock_lotacoes_db
from app.services.validation_service import validation_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard-kpis")
async def get_dashboard_kpis(escola_id: int = None, turno_id: int = None):
    """Retrieve real-time BI aggregations and teacher workload progress metrics."""
    filtered = list(mock_lotacoes_db)
    if escola_id:
        filtered = [l for l in filtered if l["escola_id"] == escola_id]
    if turno_id:
        filtered = [l for l in filtered if l["turno_id"] == turno_id]

    active_escolas = len(set(l["escola_id"] for l in filtered))
    active_turmas = len(set(f"{l['escola_id']}_{l['turma']}" for l in filtered))
    active_oficineiros = len(set(l["oficineiro_id"] for l in filtered))

    total_horas_aula = sum(l["horas_aula"] for l in filtered)
    total_horas_plan = sum(l["horas_planejamento"] for l in filtered)
    total_rede_hours = total_horas_aula + total_horas_plan

    # Calculate workload breakdown per teacher
    teacher_hours = {}
    for l in mock_lotacoes_db:
        t_id = l["oficineiro_id"]
        t_name = l["oficineiro_nome"]
        tot = l["horas_aula"] + l["horas_planejamento"]
        teacher_hours[t_id] = teacher_hours.get(t_id, {"nome": t_name, "total": 0.0})
        teacher_hours[t_id]["total"] += tot

    workload_summary = []
    for t_id, data in teacher_hours.items():
        status = validation_service.get_workload_status(data["total"])
        workload_summary.append({
            "oficineiro_id": t_id,
            "nome": data["nome"],
            "total_hours": data["total"],
            "status_label": status.status_label,
            "is_overloaded": status.is_overloaded
        })

    return {
        "active_escolas": active_escolas,
        "active_turmas": active_turmas,
        "active_oficineiros": active_oficineiros,
        "total_horas_aula": total_horas_aula,
        "total_horas_plan": total_horas_plan,
        "total_rede_hours": total_rede_hours,
        "teachers_workload": workload_summary
    }
