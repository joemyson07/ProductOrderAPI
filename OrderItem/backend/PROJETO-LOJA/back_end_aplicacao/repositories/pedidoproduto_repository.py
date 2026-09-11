from sqlalchemy.orm import Session

from models.pedidoproduto_model import PedidoProduto


class PedidoProdutoRepository:

    def __init__(self, db: Session):

        self.db = db

    def criar(self, item: PedidoProduto):

        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)

        return item

    def buscar(
        self,
        idpedido: int,
        idproduto: int
    ):

        return (
            self.db.query(PedidoProduto)
            .filter(
                PedidoProduto.idpedido == idpedido,
                PedidoProduto.idproduto == idproduto
            )
            .first()
        )

    def listar_por_pedido(self, idpedido: int):

        return (
            self.db.query(PedidoProduto)
            .filter(
                PedidoProduto.idpedido == idpedido
            )
            .all()
        )

    def atualizar(self, item: PedidoProduto):

        self.db.commit()
        self.db.refresh(item)

        return item

    def remover(self, item: PedidoProduto):

        self.db.delete(item)
        self.db.commit()
