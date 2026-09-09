from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Setor(Base):

    __tablename__ = "setor"

    idsetor: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    setor: Mapped[str] = mapped_column(
        String(45),
        nullable=False
    )

    produtos = relationship(
        "Produto",
        back_populates="setor"
    )
