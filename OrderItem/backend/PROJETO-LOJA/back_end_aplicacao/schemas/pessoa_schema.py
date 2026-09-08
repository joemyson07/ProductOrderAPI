from datetime import date

from pydantic import BaseModel, ConfigDict


class PessoaBase(BaseModel):

    nome: str
    cpf: int
    data_nascimento: date
    sexo: str
    telefone: int
    email: str
    senha: str


class PessoaCreate(PessoaBase):
    pass


class PessoaUpdate(BaseModel):

    nome: str | None = None
    telefone: int | None = None
    email: str | None = None
    senha: str | None = None


class PessoaResponse(PessoaBase):

    idpessoa: int

    model_config = ConfigDict(
        from_attributes=True
    )
