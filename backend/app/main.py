from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import lotacoes, analytics, import_export

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="GTI Educação - Sistema Corporativo de Gestão de Tempo Integral (1º ao 9º Ano)"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lotacoes.router)
app.include_router(analytics.router)
app.include_router(import_export.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "max_weekly_hours": settings.max_weekly_hours
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
