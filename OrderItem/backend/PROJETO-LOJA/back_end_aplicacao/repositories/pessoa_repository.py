from sqlalchemy.orm import Session

from models.pessoa_model import Pessoa


class PessoaRepository:

    def __init__(self, db: Session):
        self.db = db

    def criar(self, pessoa: Pessoa) -> Pessoa:

        self.db.add(pessoa)
        self.db.commit()
        self.db.refresh(pessoa)

        return pessoa

    def buscar_por_id(self, idpessoa: int):

        return (
            self.db.query(Pessoa)
            .filter(Pessoa.idpessoa == idpessoa)
            .first()
        )

    def listar(self):

        return self.db.query(Pessoa).all()

    def atualizar(self, pessoa: Pessoa):

        self.db.commit()
        self.db.refresh(pessoa)

        return pessoa

    def remover(self, pessoa: Pessoa):

        self.db.delete(pessoa)
        self.db.commit()
