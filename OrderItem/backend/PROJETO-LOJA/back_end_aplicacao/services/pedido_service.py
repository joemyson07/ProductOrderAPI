from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.pedido_model import Pedido
from repositories.pedido_repository import PedidoRepository
from repositories.pessoa_repository import PessoaRepository
from schemas.pedido_schema import (
    PedidoCreate,
    PedidoUpdate
)


class PedidoService:

    def __init__(self, db: Session):

        self.repository = PedidoRepository(db)
        self.pessoa_repository = PessoaRepository(db)

    def criar(self, dados: PedidoCreate):

        pessoa = self.pessoa_repository.buscar_por_id(
            dados.idpessoa
        )

        if not pessoa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pessoa não encontrada"
            )

        pedido = Pedido(
            idpessoa=dados.idpessoa,
            data_pedido=dados.data_pedido,
            status_pedido=dados.status_pedido
        )

        return self.repository.criar(pedido)

    def buscar_por_id(self, idpedido: int):

        pedido = self.repository.buscar_por_id(
            idpedido
        )

        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido não encontrado"
            )

        return pedido

    def listar(self):

        return self.repository.listar()

    def atualizar(
        self,
        idpedido: int,
        dados: PedidoUpdate
    ):

        pedido = self.buscar_por_id(idpedido)

        for campo, valor in dados.model_dump(
            exclude_unset=True
        ).items():

            setattr(pedido, campo, valor)

        return self.repository.atualizar(pedido)

    def remover(self, idpedido: int):

        pedido = self.buscar_por_id(idpedido)

        self.repository.remover(pedido)
