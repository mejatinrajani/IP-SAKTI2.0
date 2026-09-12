from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import compliance, ip_core, innovation, language, orchestrator, auth

app = FastAPI(
    title="IP-SAKTI Sahayak 2.0 Engine",
    description="Statutory IP & Regulatory Guidance API for the Ministry of Ayush",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Subsystems
app.include_router(ip_core.router, prefix="/api/v1/ip-core", tags=["Module 1: IP Core & RAG"])
app.include_router(compliance.router, prefix="/api/v1/compliance", tags=["Module 2: Compliance & ABS"])
app.include_router(innovation.router, prefix="/api/v1/innovation", tags=["Module 3: Innovation & Graph"])
app.include_router(language.router, prefix="/api/v1/language", tags=["Module 4: Multilingual (Bhashini)"])
app.include_router(orchestrator.router, prefix="/api/v1/orchestrate", tags=["Master Pipeline"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])

@app.get("/health", tags=["System"])
async def system_health_check():
    return {
        "status": "HEALTHY",
        "engine": "IP-SAKTI 2.0",
        "jurisdiction_isolation": "ACTIVE",
        "citation_validator_rules": 56
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)