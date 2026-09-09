from sqlalchemy.orm import Session

from models.produto_model import Produto


class ProdutoRepository:

    def __init__(self, db: Session):

        self.db = db

    def criar(self, produto: Produto):

        self.db.add(produto)
        self.db.commit()
        self.db.refresh(produto)

        return produto

    def buscar_por_id(self, idproduto: int):

        return (
            self.db.query(Produto)
            .filter(
                Produto.idproduto == idproduto
            )
            .first()
        )

    def listar(self):

        return self.db.query(Produto).all()

    def atualizar(self, produto: Produto):

        self.db.commit()
        self.db.refresh(produto)

        return produto

    def remover(self, produto: Produto):

        self.db.delete(produto)
        self.db.commit()
