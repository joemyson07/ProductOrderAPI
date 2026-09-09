from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from controllers.setor_controller import SetorController
from database import get_db

from schemas.setor_schema import (
    SetorCreate,
    SetorResponse,
    SetorUpdate
)


router = APIRouter(
    prefix="/setores",
    tags=["Setores"]
)


@router.post(
    "/",
    response_model=SetorResponse,
    status_code=status.HTTP_201_CREATED
)
def criar(
    dados: SetorCreate,
    db: Session = Depends(get_db)
):
    controller = SetorController(db)

    return controller.criar(dados)


@router.get(
    "/",
    response_model=list[SetorResponse]
)
def listar(
    db: Session = Depends(get_db)
):
    controller = SetorController(db)

    return controller.listar()


@router.get(
    "/{idsetor}",
    response_model=SetorResponse
)
def buscar(
    idsetor: int,
    db: Session = Depends(get_db)
):
    controller = SetorController(db)

    return controller.buscar_por_id(idsetor)


@router.put(
    "/{idsetor}",
    response_model=SetorResponse
)
def atualizar(
    idsetor: int,
    dados: SetorUpdate,
    db: Session = Depends(get_db)
):
    controller = SetorController(db)

    return controller.atualizar(
        idsetor,
        dados
    )


@router.delete(
    "/{idsetor}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remover(
    idsetor: int,
    db: Session = Depends(get_db)
):
    controller = SetorController(db)

    controller.remover(idsetor)

    return None
