from sqlalchemy.orm import Session

from schemas.pedidoproduto_schema import (
    PedidoProdutoCreate,
    PedidoProdutoUpdate
)

from services.pedidoproduto_service import (
    PedidoProdutoService
)


class PedidoProdutoController:

    def __init__(self, db: Session):
        self.service = PedidoProdutoService(db)

    def adicionar(
        self,
        dados: PedidoProdutoCreate
    ):
        return self.service.adicionar(dados)

    def listar_por_pedido(
        self,
        idpedido: int
    ):
        return self.service.listar_por_pedido(
            idpedido
        )

    def atualizar_quantidade(
        self,
        idpedido: int,
        idproduto: int,
        dados: PedidoProdutoUpdate
    ):
        return self.service.atualizar_quantidade(
            idpedido,
            idproduto,
            dados
        )

    def remover(
        self,
        idpedido: int,
        idproduto: int
    ):
        return self.service.remover(
            idpedido,
            idproduto
        )
