from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.pessoa_model import Pessoa
from repositories.pessoa_repository import PessoaRepository
from schemas.pessoa_schema import PessoaCreate, PessoaUpdate


class PessoaService:

    def __init__(self, db: Session):

        self.repository = PessoaRepository(db)

    def criar(self, dados: PessoaCreate):

        pessoa = Pessoa(
            nome=dados.nome,
            cpf=dados.cpf,
            data_nascimento=dados.data_nascimento,
            sexo=dados.sexo,
            telefone=dados.telefone,
            email=dados.email,
            senha=dados.senha
        )

        return self.repository.criar(pessoa)

    def buscar_por_id(self, idpessoa: int):

        pessoa = self.repository.buscar_por_id(idpessoa)

        if not pessoa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pessoa não encontrada"
            )

        return pessoa

    def listar(self):

        return self.repository.listar()

    def atualizar(
        self,
        idpessoa: int,
        dados: PessoaUpdate
    ):

        pessoa = self.buscar_por_id(idpessoa)

        dados_atualizacao = dados.model_dump(
            exclude_unset=True
        )

        for campo, valor in dados_atualizacao.items():
            setattr(pessoa, campo, valor)

        return self.repository.atualizar(pessoa)

    def remover(self, idpessoa: int):

        pessoa = self.buscar_por_id(idpessoa)

        self.repository.remover(pessoa)
