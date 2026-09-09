from sqlalchemy.orm import Session

from schemas.setor_schema import (
    SetorCreate,
    SetorUpdate
)

from services.setor_service import SetorService


class SetorController:

    def __init__(self, db: Session):
        self.service = SetorService(db)

    def criar(self, dados: SetorCreate):
        return self.service.criar(dados)

    def buscar_por_id(self, idsetor: int):
        return self.service.buscar_por_id(idsetor)

    def listar(self):
        return self.service.listar()

    def atualizar(
        self,
        idsetor: int,
        dados: SetorUpdate
    ):
        return self.service.atualizar(
            idsetor,
            dados
        )

    def remover(self, idsetor: int):
        return self.service.remover(idsetor)
