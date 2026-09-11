from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PedidoProdutoBase(BaseModel):

    idpedido: int
    idproduto: int
    quantidade: int
    valor_unitario: Decimal


class PedidoProdutoCreate(PedidoProdutoBase):
    pass


class PedidoProdutoUpdate(BaseModel):
    quantidade: int = Field(gt=0)


class PedidoProdutoResponse(PedidoProdutoBase):

    model_config = ConfigDict(
        from_attributes=True
    )
