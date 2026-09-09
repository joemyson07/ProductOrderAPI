from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Produto(Base):

    __tablename__ = "produto"

    idproduto: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    idsetor: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("setor.idsetor"),
        nullable=False
    )

    produto: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    descricao_produto: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    valor_unitario: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    unidade: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    estoque: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    setor = relationship(
        "Setor",
        back_populates="produtos"
    )

    pedidos = relationship(
        "PedidoProduto",
        back_populates="produto",
        cascade="all, delete-orphan"
    )
