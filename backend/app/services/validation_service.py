from typing import List, Dict, Any, Tuple
from app.models.schemas import LotacaoCreate, WorkloadValidation
from app.config import settings

class ValidationService:
    def __init__(self, max_hours: float = 40.0):
        self.max_hours = max_hours

    def calculate_oficineiro_hours(
        self,
        oficineiro_id: int,
        existing_lotacoes: List[Dict[str, Any]],
        new_hours: float = 0.0,
        exclude_lotacao_id: int = None
    ) -> float:
        """Calculate total weekly workload (aula + planejamento) for an oficineiro."""
        total = new_hours
        for lot in existing_lotacoes:
            if lot.get("oficineiro_id") == oficineiro_id:
                if exclude_lotacao_id and lot.get("id") == exclude_lotacao_id:
                    continue
                h_aula = float(lot.get("horas_aula", 0))
                h_plan = float(lot.get("horas_planejamento", 0))
                total += (h_aula + h_plan)
        return total

    def validate_lotacao(
        self,
        lotacao: LotacaoCreate,
        existing_lotacoes: List[Dict[str, Any]],
        exclude_lotacao_id: int = None
    ) -> Tuple[bool, str]:
        """Validate an assignment against 40h limit and shift schedule conflicts."""
        # 1. Validate 40h Workload Limit
        assignment_hours = lotacao.horas_aula + lotacao.horas_planejamento
        total_hours = self.calculate_oficineiro_hours(
            oficineiro_id=lotacao.oficineiro_id,
            existing_lotacoes=existing_lotacoes,
            new_hours=assignment_hours,
            exclude_lotacao_id=exclude_lotacao_id
        )

        if total_hours > self.max_hours:
            return False, f"Excesso de carga horária: total acumularia {total_hours:.1f}h (limite é {self.max_hours}h)."

        # 2. Validate Time & Shift Conflicts
        new_days = set(d.strip().lower() for d in lotacao.dias.split(","))

        for lot in existing_lotacoes:
            if exclude_lotacao_id and lot.get("id") == exclude_lotacao_id:
                continue
            if lot.get("oficineiro_id") == lotacao.oficineiro_id:
                # Same shift check
                if lot.get("turno_id") == lotacao.turno_id:
                    existing_days = set(d.strip().lower() for d in str(lot.get("dias", "")).split(","))
                    overlap = new_days.intersection(existing_days)
                    if overlap:
                        return False, f"Conflito de horário: professor já alocado no turno (ID {lotacao.turno_id}) nos dias: {', '.join(overlap).title()}."

        return True, "Lotação válida."

    def get_workload_status(self, total_hours: float) -> WorkloadValidation:
        is_overloaded = total_hours > self.max_hours
        if total_hours > self.max_hours:
            label = "Sobrecarga"
        elif total_hours >= 36.0:
            label = "No Limite"
        else:
            label = "Disponível"

        return WorkloadValidation(
            oficineiro_id=0,
            total_hours=total_hours,
            is_overloaded=is_overloaded,
            status_label=label
        )

validation_service = ValidationService(settings.max_weekly_hours)
