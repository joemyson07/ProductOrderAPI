from sqlalchemy.orm import Session

from schemas.pessoa_schema import (
    PessoaCreate,
    PessoaUpdate
)
from services.pessoa_service import PessoaService


class PessoaController:

    def __init__(self, db: Session):

        self.service = PessoaService(db)

    def criar(self, dados: PessoaCreate):

        return self.service.criar(dados)

    def buscar_por_id(self, idpessoa: int):

        return self.service.buscar_por_id(idpessoa)

    def listar(self):

        return self.service.listar()

    def atualizar(
        self,
        idpessoa: int,
        dados: PessoaUpdate
    ):

        return self.service.atualizar(
            idpessoa,
            dados
        )

    def remover(self, idpessoa: int):

        return self.service.remover(idpessoa)
