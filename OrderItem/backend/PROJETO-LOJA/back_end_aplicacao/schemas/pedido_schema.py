from datetime import date

from pydantic import BaseModel, ConfigDict


class PedidoBase(BaseModel):

    idpessoa: int
    data_pedido: date
    status_pedido: str


class PedidoCreate(PedidoBase):
    pass


class PedidoUpdate(BaseModel):

    status_pedido: str | None = None


class PedidoResponse(PedidoBase):

    idpedido: int

    model_config = ConfigDict(
        from_attributes=True
    )
