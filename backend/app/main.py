from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth_routes, doc_routes, user_routes

app = FastAPI(
    title="Access-Controlled Library Infrastructure API",
    description="Custom RBAC Engine mapping directly to native PostgreSQL data types.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(doc_routes.router)
app.include_router(user_routes.router)

@app.get("/")
def health():
    return {"status": "online", "engine": "RBAC Guardian Active"}