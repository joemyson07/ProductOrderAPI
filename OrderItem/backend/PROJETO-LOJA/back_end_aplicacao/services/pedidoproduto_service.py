from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.pedidoproduto_model import PedidoProduto

from repositories.pedido_repository import PedidoRepository
from repositories.produto_repository import ProdutoRepository
from repositories.pedidoproduto_repository import (
    PedidoProdutoRepository
)

from schemas.pedidoproduto_schema import (
    PedidoProdutoCreate
)


class PedidoProdutoService:

    def __init__(self, db: Session):

        self.repository = PedidoProdutoRepository(db)

        self.pedido_repository = PedidoRepository(db)

        self.produto_repository = ProdutoRepository(db)

    def adicionar(
        self,
        dados: PedidoProdutoCreate
    ):

        pedido = self.pedido_repository.buscar_por_id(
            dados.idpedido
        )

        if not pedido:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido não encontrado"
            )

        produto = self.produto_repository.buscar_por_id(
            dados.idproduto
        )

        if not produto:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado"
            )

        item_existente = self.repository.buscar(
            dados.idpedido,
            dados.idproduto
        )

        if item_existente:

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Produto já está no pedido"
            )

        if produto.estoque < dados.quantidade:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Estoque insuficiente"
            )

        item = PedidoProduto(
            idpedido=dados.idpedido,
            idproduto=dados.idproduto,
            quantidade=dados.quantidade,
            valor_unitario=dados.valor_unitario
        )

        produto.estoque -= dados.quantidade

        return self.repository.criar(item)

    def listar_por_pedido(self, idpedido: int):

        pedido = self.pedido_repository.buscar_por_id(
            idpedido
        )

        if not pedido:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido não encontrado"
            )

        return self.repository.listar_por_pedido(
            idpedido
        )

    def remover(
        self,
        idpedido: int,
        idproduto: int
    ):

        item = self.repository.buscar(
            idpedido,
            idproduto
        )

        if not item:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado no pedido"
            )

        self.repository.remover(item)
