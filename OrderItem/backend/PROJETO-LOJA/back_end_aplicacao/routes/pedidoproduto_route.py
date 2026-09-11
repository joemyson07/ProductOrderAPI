from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from controllers.pedidoproduto_controller import (
    PedidoProdutoController
)

from database import get_db

from schemas.pedidoproduto_schema import (
    PedidoProdutoCreate,
    PedidoProdutoResponse,
    PedidoProdutoUpdate
)


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedido Produtos"]
)


@router.post(
    "/{idpedido}/produtos",
    response_model=PedidoProdutoResponse,
    status_code=status.HTTP_201_CREATED
)
def adicionar_produto(
    idpedido: int,
    dados: PedidoProdutoCreate,
    db: Session = Depends(get_db)
):
    controller = PedidoProdutoController(db)

    # Garante que o idpedido da URL seja utilizado
    dados.idpedido = idpedido

    return controller.adicionar(dados)


@router.get(
    "/{idpedido}/produtos",
    response_model=list[PedidoProdutoResponse]
)
def listar_produtos(
    idpedido: int,
    db: Session = Depends(get_db)
):
    controller = PedidoProdutoController(db)

    return controller.listar_por_pedido(idpedido)


@router.patch(
    "/{idpedido}/produtos/{idproduto}",
    response_model=PedidoProdutoResponse
)
def atualizar_quantidade(
    idpedido: int,
    idproduto: int,
    dados: PedidoProdutoUpdate,
    db: Session = Depends(get_db)
):
    controller = PedidoProdutoController(db)

    return controller.atualizar_quantidade(
        idpedido,
        idproduto,
        dados
    )


@router.delete(
    "/{idpedido}/produtos/{idproduto}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remover_produto(
    idpedido: int,
    idproduto: int,
    db: Session = Depends(get_db)
):
    controller = PedidoProdutoController(db)

    controller.remover(
        idpedido,
        idproduto
    )

    return None
