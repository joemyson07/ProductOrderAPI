from sqlalchemy import BigInteger, Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Pessoa(Base):

    __tablename__ = "pessoa"

    idpessoa: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    nome: Mapped[str] = mapped_column(
        String(70),
        nullable=False
    )

    cpf: Mapped[int] = mapped_column(
        BigInteger,
        unique=True,
        nullable=False
    )

    data_nascimento: Mapped[Date] = mapped_column(
        Date,
        nullable=False
    )

    sexo: Mapped[str] = mapped_column(
        String(1),
        nullable=False
    )

    telefone: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    senha: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    pedidos = relationship(
        "Pedido",
        back_populates="pessoa",
        cascade="all, delete-orphan"
    )
