from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from controllers.pessoa_controller import PessoaController
from database import get_db
from schemas.pessoa_schema import (
    PessoaCreate,
    PessoaResponse,
    PessoaUpdate
)


router = APIRouter(
    prefix="/pessoas",
    tags=["Pessoas"]
)


@router.post(
    "/",
    response_model=PessoaResponse,
    status_code=status.HTTP_201_CREATED
)
def criar(
    dados: PessoaCreate,
    db: Session = Depends(get_db)
):

    controller = PessoaController(db)

    return controller.criar(dados)


@router.get(
    "/",
    response_model=list[PessoaResponse]
)
def listar(
    db: Session = Depends(get_db)
):

    controller = PessoaController(db)

    return controller.listar()


@router.get(
    "/{idpessoa}",
    response_model=PessoaResponse
)
def buscar(
    idpessoa: int,
    db: Session = Depends(get_db)
):

    controller = PessoaController(db)

    return controller.buscar_por_id(idpessoa)


@router.put(
    "/{idpessoa}",
    response_model=PessoaResponse
)
def atualizar(
    idpessoa: int,
    dados: PessoaUpdate,
    db: Session = Depends(get_db)
):

    controller = PessoaController(db)

    return controller.atualizar(
        idpessoa,
        dados
    )


@router.delete(
    "/{idpessoa}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remover(
    idpessoa: int,
    db: Session = Depends(get_db)
):

    controller = PessoaController(db)

    controller.remover(idpessoa)

    return None
