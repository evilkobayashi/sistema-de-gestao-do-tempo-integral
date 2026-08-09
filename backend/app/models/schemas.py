from pydantic import BaseModel, Field
from typing import List, Optional

class MunicipioSchema(BaseModel):
    id: Optional[int] = None
    nome: str
    uf: str = "RJ"
    secretaria_nome: Optional[str] = "Secretaria Municipal de Educação"
    logo_url: Optional[str] = None

class EscolaSchema(BaseModel):
    id: Optional[int] = None
    municipio_id: Optional[int] = 1
    nome: str
    segmento: str = "Ensino Fundamental (1º ao 9º Ano)"
    uf: str = "RJ"

class OficinaSchema(BaseModel):
    id: Optional[int] = None
    nome: str
    eixo_bncc: Optional[str] = "Recomposição de Aprendizagem" # e.g., Letramento, Matemática, Ciência, Robótica, Esporte
    segmento: str = "Ensino Fundamental (1º ao 9º Ano)"

class OficineiroSchema(BaseModel):
    id: Optional[int] = None
    nome: str
    cpf: Optional[str] = None
    email: Optional[str] = None
    max_horas_semanais: float = 40.0

class TurnoSchema(BaseModel):
    id: Optional[int] = None
    nome: str

class LotacaoCreate(BaseModel):
    escola_id: int
    turno_id: int
    turma: str # e.g. "1º Ano A", "5º Ano B", "7º Ano C", "9º Ano A"
    oficina_id: int
    oficineiro_id: int
    horas_aula: float = Field(..., ge=0)
    horas_planejamento: float = Field(..., ge=0)
    dias: str  # e.g., "Seg, Qua, Sex"

class LotacaoResponse(LotacaoCreate):
    id: int
    municipio_nome: Optional[str] = "Rede Municipal"
    escola_nome: Optional[str] = None
    oficina_nome: Optional[str] = None
    oficineiro_nome: Optional[str] = None
    turno_nome: Optional[str] = None
    segmento: str = "Ensino Fundamental (1º ao 9º Ano)"

class WorkloadValidation(BaseModel):
    oficineiro_id: int
    total_hours: float
    max_allowed_hours: float = 40.0
    is_overloaded: bool
    status_label: str  # "Disponível", "No Limite", "Sobrecarga"

class ImportRowError(BaseModel):
    row_index: int
    teacher_name: str
    reason: str

class ImportReport(BaseModel):
    total_processed: int
    imported_count: int
    failed_count: int
    errors: List[ImportRowError]
