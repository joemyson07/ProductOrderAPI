from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.pessoa_route import router as pessoa_router
from routes.pedido_route import router as pedido_router
from routes.produto_route import router as produto_router
from routes.setor_route import router as setor_router
from routes.pedidoproduto_route import router as pedidoproduto_router


app = FastAPI(
    title="API de Pedidos",
    description="API para gerenciamento de pessoas, pedidos e produtos",
    version="1.0.0"
)


app.include_router(pessoa_router)
app.include_router(pedido_router)
app.include_router(produto_router)
app.include_router(setor_router)
app.include_router(pedidoproduto_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods = ["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():

    return {
        "message": "API funcionando"
    }



"""
    PARA EXECUTAR O PROJETO DIGITE A LINHA DE COMANDO:
    uvicorn main:app --reload

    python -m  uvicorn main:app --reload
"""