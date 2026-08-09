from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.models.schemas import LotacaoCreate, LotacaoResponse
from app.services.validation_service import validation_service

router = APIRouter(prefix="/lotacoes", tags=["lotacoes"])

# Dynamic mock storage for Ensino Fundamental Public Schools (1º ao 9º Ano)
mock_lotacoes_db = [
    {
        "id": 1,
        "municipio_nome": "Rede Municipal de Ensino",
        "escola_id": 1,
        "escola_nome": "Escola Municipal Paulo Freire",
        "turno_id": 1,
        "turno_nome": "Manhã",
        "turma": "1º Ano A",
        "oficina_id": 1,
        "oficina_nome": "Recomposição: Alfabetização & Leitura",
        "oficineiro_id": 1,
        "oficineiro_nome": "Prof.ª Maria Oliveira",
        "horas_aula": 16.0,
        "horas_planejamento": 4.0,
        "dias": "Seg, Qua",
        "segmento": "Ensino Fundamental (1º ao 9º Ano)"
    },
    {
        "id": 2,
        "municipio_nome": "Rede Municipal de Ensino",
        "escola_id": 2,
        "escola_nome": "Escola Municipal Anísio Teixeira",
        "turno_id": 2,
        "turno_nome": "Tarde",
        "turma": "5º Ano B",
        "oficina_id": 2,
        "oficina_nome": "Robótica Educativa & Cultura Maker",
        "oficineiro_id": 2,
        "oficineiro_nome": "Prof. Carlos Souza",
        "horas_aula": 20.0,
        "horas_planejamento": 5.0,
        "dias": "Ter, Qui",
        "segmento": "Ensino Fundamental (1º ao 9º Ano)"
    },
    {
        "id": 3,
        "municipio_nome": "Rede Municipal de Ensino",
        "escola_id": 1,
        "escola_nome": "Escola Municipal Paulo Freire",
        "turno_id": 2,
        "turno_nome": "Tarde",
        "turma": "7º Ano C",
        "oficina_id": 3,
        "oficina_nome": "Pensamento Computacional & Lógica",
        "oficineiro_id": 3,
        "oficineiro_nome": "Prof.ª Juliana Costa",
        "horas_aula": 15.0,
        "horas_planejamento": 5.0,
        "dias": "Qua, Sex",
        "segmento": "Ensino Fundamental (1º ao 9º Ano)"
    },
    {
        "id": 4,
        "municipio_nome": "Rede Municipal de Ensino",
        "escola_id": 2,
        "escola_nome": "Escola Municipal Anísio Teixeira",
        "turno_id": 1,
        "turno_nome": "Manhã",
        "turma": "9º Ano A",
        "oficina_id": 4,
        "oficina_nome": "Cultura Digital & Preparatório SAEB/OBMEP",
        "oficineiro_id": 1,
        "oficineiro_nome": "Prof.ª Maria Oliveira",
        "horas_aula": 12.0,
        "horas_planejamento": 3.0,
        "dias": "Ter, Qui",
        "segmento": "Ensino Fundamental (1º ao 9º Ano)"
    }
]

@router.get("", response_model=List[LotacaoResponse])
async def list_lotacoes(escola_id: Optional[int] = None, turno_id: Optional[int] = None):
    """List all teacher assignments for Ensino Fundamental public schools (1º ao 9º Ano)."""
    result = list(mock_lotacoes_db)
    if escola_id:
        result = [l for l in result if l["escola_id"] == escola_id]
    if turno_id:
        result = [l for l in result if l["turno_id"] == turno_id]
    return result

@router.post("", response_model=LotacaoResponse, status_code=201)
async def create_lotacao(lotacao: LotacaoCreate):
    """Create a new teacher assignment with 40h workload and shift conflict checks."""
    is_valid, error_msg = validation_service.validate_lotacao(lotacao, mock_lotacoes_db)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    new_id = len(mock_lotacoes_db) + 1
    new_record = {
        "id": new_id,
        "municipio_nome": "Rede Municipal de Ensino",
        "escola_id": lotacao.escola_id,
        "escola_nome": f"Escola Municipal #{lotacao.escola_id}",
        "turno_id": lotacao.turno_id,
        "turno_nome": "Manhã" if lotacao.turno_id == 1 else "Tarde",
        "turma": lotacao.turma,
        "oficina_id": lotacao.oficina_id,
        "oficina_nome": f"Oficina Tempo Integral #{lotacao.oficina_id}",
        "oficineiro_id": lotacao.oficineiro_id,
        "oficineiro_nome": f"Prof. #{lotacao.oficineiro_id}",
        "horas_aula": lotacao.horas_aula,
        "horas_planejamento": lotacao.horas_planejamento,
        "dias": lotacao.dias,
        "segmento": "Ensino Fundamental (1º ao 9º Ano)"
    }

    mock_lotacoes_db.append(new_record)
    return new_record

@router.delete("/{lotacao_id}", status_code=204)
async def delete_lotacao(lotacao_id: int):
    """Delete an assignment record."""
    global mock_lotacoes_db
    mock_lotacoes_db = [l for l in mock_lotacoes_db if l["id"] != lotacao_id]
    return None
