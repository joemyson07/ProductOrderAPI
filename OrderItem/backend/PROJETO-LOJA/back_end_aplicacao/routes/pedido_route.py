from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from controllers.pedido_controller import PedidoController
from database import get_db

from schemas.pedido_schema import (
    PedidoCreate,
    PedidoResponse,
    PedidoUpdate
)


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)


@router.post(
    "/",
    response_model=PedidoResponse,
    status_code=status.HTTP_201_CREATED
)
def criar(
    dados: PedidoCreate,
    db: Session = Depends(get_db)
):
    controller = PedidoController(db)

    return controller.criar(dados)


@router.get(
    "/",
    response_model=list[PedidoResponse]
)
def listar(
    db: Session = Depends(get_db)
):
    controller = PedidoController(db)

    return controller.listar()


@router.get(
    "/{idpedido}",
    response_model=PedidoResponse
)
def buscar(
    idpedido: int,
    db: Session = Depends(get_db)
):
    controller = PedidoController(db)

    return controller.buscar_por_id(idpedido)


@router.put(
    "/{idpedido}",
    response_model=PedidoResponse
)
def atualizar(
    idpedido: int,
    dados: PedidoUpdate,
    db: Session = Depends(get_db)
):
    controller = PedidoController(db)

    return controller.atualizar(
        idpedido,
        dados
    )


@router.delete(
    "/{idpedido}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remover(
    idpedido: int,
    db: Session = Depends(get_db)
):
    controller = PedidoController(db)

    controller.remover(idpedido)

    return None
