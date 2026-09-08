from sqlalchemy.orm import Session

from schemas.pedido_schema import (
    PedidoCreate,
    PedidoUpdate
)

from services.pedido_service import PedidoService


class PedidoController:

    def __init__(self, db: Session):
        self.service = PedidoService(db)

    def criar(self, dados: PedidoCreate):
        return self.service.criar(dados)

    def buscar_por_id(self, idpedido: int):
        return self.service.buscar_por_id(idpedido)

    def listar(self):
        return self.service.listar()

    def atualizar(
        self,
        idpedido: int,
        dados: PedidoUpdate
    ):
        return self.service.atualizar(
            idpedido,
            dados
        )

    def remover(self, idpedido: int):
        return self.service.remover(idpedido)
