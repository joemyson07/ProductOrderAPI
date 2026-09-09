from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PedidoProdutoBase(BaseModel):

    idpedido: int
    idproduto: int
    quantidade: int
    valor_unitario: Decimal


class PedidoProdutoCreate(PedidoProdutoBase):
    pass


class PedidoProdutoUpdate(BaseModel):

    quantidade: int | None = None
    valor_unitario: Decimal | None = None


class PedidoProdutoResponse(PedidoProdutoBase):

    model_config = ConfigDict(
        from_attributes=True
    )
