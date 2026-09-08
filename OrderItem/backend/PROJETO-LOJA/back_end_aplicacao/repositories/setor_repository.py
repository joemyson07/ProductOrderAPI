from sqlalchemy.orm import Session

from models.setor_model import Setor


class SetorRepository:

    def __init__(self, db: Session):
        self.db = db

    def criar(self, setor: Setor):

        self.db.add(setor)
        self.db.commit()
        self.db.refresh(setor)

        return setor

    def buscar_por_id(self, idsetor: int):

        return (
            self.db.query(Setor)
            .filter(Setor.idsetor == idsetor)
            .first()
        )

    def listar(self):

        return self.db.query(Setor).all()

    def atualizar(self, setor: Setor):

        self.db.commit()
        self.db.refresh(setor)

        return setor

    def remover(self, setor: Setor):

        self.db.delete(setor)
        self.db.commit()
