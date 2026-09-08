from sqlalchemy.orm import Session

from schemas.produto_schema import (
    ProdutoCreate,
    ProdutoUpdate
)

from services.produto_service import ProdutoService


class ProdutoController:

    def __init__(self, db: Session):

        self.service = ProdutoService(db)

    def criar(self, dados: ProdutoCreate):

        return self.service.criar(dados)

    def buscar_por_id(self, idproduto: int):

        return self.service.buscar_por_id(idproduto)

    def listar(self):

        return self.service.listar()

    def atualizar(
        self,
        idproduto: int,
        dados: ProdutoUpdate
    ):

        return self.service.atualizar(
            idproduto,
            dados
        )

    def remover(self, idproduto: int):

        return self.service.remover(idproduto)
