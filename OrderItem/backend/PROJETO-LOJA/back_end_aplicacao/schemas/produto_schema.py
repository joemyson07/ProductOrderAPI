from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProdutoBase(BaseModel):

    idsetor: int
    produto: str
    descricao_produto: str | None = None
    valor_unitario: Decimal
    unidade: str
    estoque: int


class ProdutoCreate(ProdutoBase):
    pass


class ProdutoUpdate(BaseModel):

    idsetor: int | None = None
    produto: str | None = None
    descricao_produto: str | None = None
    valor_unitario: Decimal | None = None
    unidade: str | None = None
    estoque: int | None = None


class ProdutoResponse(ProdutoBase):

    idproduto: int

    model_config = ConfigDict(
        from_attributes=True
    )
