from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.excel_importer import excel_importer
from app.routers.lotacoes import mock_lotacoes_db

router = APIRouter(prefix="/import-export", tags=["import-export"])

@router.post("/import-spreadsheet")
async def import_spreadsheet(file: UploadFile = File(...)):
    """Upload and validate an Excel/CSV spreadsheet with bulk teacher assignments."""
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Envie um arquivo .xlsx ou .csv.")

    contents = await file.read()

    # Pre-populated mapping dicts for names to IDs
    escola_map = {"em emef queimados centro": 1, "em emef monteiro lobato": 2}
    oficina_map = {"teatro & expressão": 1, "robótica & inovação": 2}
    oficineiro_map = {"prof. ana silva": 1, "prof. carlos souza": 2}
    turno_map = {"manhã": 1, "tarde": 2}

    valid_records, report = excel_importer.parse_and_validate_file(
        file_bytes=contents,
        filename=file.filename,
        existing_lotacoes=mock_lotacoes_db,
        escola_map=escola_map,
        oficina_map=oficina_map,
        oficineiro_map=oficineiro_map,
        turno_map=turno_map
    )

    # Insert valid records into database
    for item in valid_records:
        new_id = len(mock_lotacoes_db) + 1
        mock_lotacoes_db.append({
            "id": new_id,
            "escola_id": item.escola_id,
            "escola_nome": f"Escola #{item.escola_id}",
            "turno_id": item.turno_id,
            "turno_nome": "Manhã" if item.turno_id == 1 else "Tarde",
            "turma": item.turma,
            "oficina_id": item.oficina_id,
            "oficina_nome": f"Oficina #{item.oficina_id}",
            "oficineiro_id": item.oficineiro_id,
            "oficineiro_nome": f"Prof. #{item.oficineiro_id}",
            "horas_aula": item.horas_aula,
            "horas_planejamento": item.horas_planejamento,
            "dias": item.dias
        })

    return report
