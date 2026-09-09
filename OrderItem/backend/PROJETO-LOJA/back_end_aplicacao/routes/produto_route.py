from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from controllers.produto_controller import ProdutoController
from database import get_db

from schemas.produto_schema import (
    ProdutoCreate,
    ProdutoResponse,
    ProdutoUpdate
)


router = APIRouter(
    prefix="/produtos",
    tags=["Produtos"]
)


@router.post(
    "/",
    response_model=ProdutoResponse,
    status_code=status.HTTP_201_CREATED
)
def criar(
    dados: ProdutoCreate,
    db: Session = Depends(get_db)
):

    controller = ProdutoController(db)

    return controller.criar(dados)


@router.get(
    "/",
    response_model=list[ProdutoResponse]
)
def listar(
    db: Session = Depends(get_db)
):

    controller = ProdutoController(db)

    return controller.listar()


@router.get(
    "/{idproduto}",
    response_model=ProdutoResponse
)
def buscar(
    idproduto: int,
    db: Session = Depends(get_db)
):

    controller = ProdutoController(db)

    return controller.buscar_por_id(
        idproduto
    )


@router.put(
    "/{idproduto}",
    response_model=ProdutoResponse
)
def atualizar(
    idproduto: int,
    dados: ProdutoUpdate,
    db: Session = Depends(get_db)
):

    controller = ProdutoController(db)

    return controller.atualizar(
        idproduto,
        dados
    )


@router.delete(
    "/{idproduto}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remover(
    idproduto: int,
    db: Session = Depends(get_db)
):

    controller = ProdutoController(db)

    controller.remover(idproduto)

    return None
