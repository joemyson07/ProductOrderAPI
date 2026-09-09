from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class PedidoProduto(Base):

    __tablename__ = "pedidoproduto"

    idpedido: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("pedido.idpedido"),
        primary_key=True
    )

    idproduto: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("produto.idproduto"),
        primary_key=True
    )

    quantidade: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    valor_unitario: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    pedido = relationship(
        "Pedido",
        back_populates="produtos"
    )

    produto = relationship(
        "Produto",
        back_populates="pedidos"
    )
