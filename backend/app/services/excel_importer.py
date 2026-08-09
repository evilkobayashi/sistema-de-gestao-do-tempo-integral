import pandas as pd
import io
from typing import List, Dict, Any, Tuple
from app.models.schemas import LotacaoCreate, ImportReport, ImportRowError
from app.services.validation_service import validation_service

class ExcelImporterService:
    def parse_and_validate_file(
        self,
        file_bytes: bytes,
        filename: str,
        existing_lotacoes: List[Dict[str, Any]],
        escola_map: Dict[str, int],
        oficina_map: Dict[str, int],
        oficineiro_map: Dict[str, int],
        turno_map: Dict[str, int]
    ) -> Tuple[List[LotacaoCreate], ImportReport]:
        """Parse Excel/CSV file and validate rows against 40h limit and shift conflicts."""
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        else:
            df = pd.read_excel(io.BytesIO(file_bytes))

        valid_lotacoes: List[LotacaoCreate] = []
        errors: List[ImportRowError] = []

        total_processed = len(df)
        simulated_existing = list(existing_lotacoes)

        for idx, row in df.iterrows():
            row_num = idx + 2  # 1-indexed header + row index
            try:
                escola_nome = str(row.get("Escola", row.get("escola", ""))).strip()
                oficina_nome = str(row.get("Oficina", row.get("oficina", ""))).strip()
                oficineiro_nome = str(row.get("Oficineiro", row.get("oficineiro", row.get("Professor", "")))).strip()
                turno_nome = str(row.get("Turno", row.get("turno", ""))).strip()
                turma = str(row.get("Turma", row.get("turma", "101"))).strip()
                h_aula = float(row.get("Horas Aula", row.get("horas_aula", 0)))
                h_plan = float(row.get("Horas Planejamento", row.get("horas_planejamento", 0)))
                dias = str(row.get("Dias", row.get("dias", "Seg, Qua"))).strip()

                if not oficineiro_nome or not escola_nome:
                    errors.append(ImportRowError(
                        row_index=row_num,
                        teacher_name=oficineiro_nome or "Desconhecido",
                        reason="Dados obrigatórios faltando (Escola ou Oficineiro)."
                    ))
                    continue

                escola_id = escola_map.get(escola_nome.lower(), 1)
                oficina_id = oficina_map.get(oficina_nome.lower(), 1)
                oficineiro_id = oficineiro_map.get(oficineiro_nome.lower(), 1)
                turno_id = turno_map.get(turno_nome.lower(), 1)

                lotacao_candidate = LotacaoCreate(
                    escola_id=escola_id,
                    turno_id=turno_id,
                    turma=turma,
                    oficina_id=oficina_id,
                    oficineiro_id=oficineiro_id,
                    horas_aula=h_aula,
                    horas_planejamento=h_plan,
                    dias=dias
                )

                is_valid, msg = validation_service.validate_lotacao(
                    lotacao_candidate,
                    simulated_existing
                )

                if is_valid:
                    valid_lotacoes.append(lotacao_candidate)
                    simulated_existing.append({
                        "escola_id": escola_id,
                        "turno_id": turno_id,
                        "oficineiro_id": oficineiro_id,
                        "horas_aula": h_aula,
                        "horas_planejamento": h_plan,
                        "dias": dias
                    })
                else:
                    errors.append(ImportRowError(
                        row_index=row_num,
                        teacher_name=oficineiro_nome,
                        reason=msg
                    ))

            except Exception as e:
                errors.append(ImportRowError(
                    row_index=row_num,
                    teacher_name="Erro na linha",
                    reason=f"Erro de formatação: {str(e)}"
                ))

        report = ImportReport(
            total_processed=total_processed,
            imported_count=len(valid_lotacoes),
            failed_count=len(errors),
            errors=errors
        )

        return valid_lotacoes, report

excel_importer = ExcelImporterService()
