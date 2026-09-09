from pydantic import BaseModel, ConfigDict


class SetorBase(BaseModel):

    setor: str


class SetorCreate(SetorBase):
    pass


class SetorUpdate(BaseModel):

    setor: str | None = None


class SetorResponse(SetorBase):

    idsetor: int

    model_config = ConfigDict(
        from_attributes=True
    )
