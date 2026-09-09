from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.produto_model import Produto
from repositories.produto_repository import ProdutoRepository
from repositories.setor_repository import SetorRepository
from schemas.produto_schema import (
    ProdutoCreate,
    ProdutoUpdate
)


class ProdutoService:

    def __init__(self, db: Session):

        self.repository = ProdutoRepository(db)
        self.setor_repository = SetorRepository(db)

    def criar(self, dados: ProdutoCreate):

        setor = self.setor_repository.buscar_por_id(
            dados.idsetor
        )

        if not setor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Setor não encontrado"
            )

        produto = Produto(
            idsetor=dados.idsetor,
            produto=dados.produto,
            descricao_produto=dados.descricao_produto,
            valor_unitario=dados.valor_unitario,
            unidade=dados.unidade,
            estoque=dados.estoque
        )

        return self.repository.criar(produto)

    def buscar_por_id(self, idproduto: int):

        produto = self.repository.buscar_por_id(
            idproduto
        )

        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado"
            )

        return produto

    def listar(self):

        return self.repository.listar()

    def atualizar(
        self,
        idproduto: int,
        dados: ProdutoUpdate
    ):

        produto = self.buscar_por_id(idproduto)

        dados_atualizacao = dados.model_dump(
            exclude_unset=True
        )

        if "idsetor" in dados_atualizacao:

            setor = self.setor_repository.buscar_por_id(
                dados_atualizacao["idsetor"]
            )

            if not setor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Setor não encontrado"
                )

        for campo, valor in dados_atualizacao.items():
            setattr(produto, campo, valor)

        return self.repository.atualizar(produto)

    def remover(self, idproduto: int):

        produto = self.buscar_por_id(idproduto)

        self.repository.remover(produto)
