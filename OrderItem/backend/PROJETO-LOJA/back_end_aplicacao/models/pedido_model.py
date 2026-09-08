from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Pedido(Base):

    __tablename__ = "pedido"

    idpedido: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    idpessoa: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("pessoa.idpessoa"),
        nullable=False
    )

    data_pedido: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    status_pedido: Mapped[str] = mapped_column(
        String(1),
        nullable=False
    )

    pessoa = relationship(
        "Pessoa",
        back_populates="pedidos"
    )

    produtos = relationship(
        "PedidoProduto",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )
