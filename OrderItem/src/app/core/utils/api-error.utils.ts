import { HttpErrorResponse } from "@angular/common/http";
import { FastApiErrorBody, FastApiValidationIssue } from "../domain/api-error.model";

export function obterMensagemApi(error: unknown): string {
    if(!(error instanceof HttpErrorResponse)) {
        return 'ocorreu um erro inesperado.';
    }
    if (error.status === 0) {
        return 'Não foi possível conectar à API. Verifique se o backend está ativo.'
    }

    const body = error.error as FastApiErrorBody | null;
    const detail = body?.detail;

    if (typeof detail === 'string' && detail.trim()) {
        return detail;
    }

    if(Array.isArray(detail)) {
        return detail.map((issue:FastApiValidationIssue) =>
        {
            const campo = issue.loc?.filter((part) => 
            part !== 'body').join('.');
                return campo ?`${campo}: ${issue.msg}`: issue.msg;
        }).join(' | ');
    }

    switch (error.status) {
        case 400: 
            return 'A requisição contém dados inválidos';
        case 404:
            return 'O recurso solicitado não foi encontrado.';
        case 409:
            return 'A operação conflita com um registro existente';
        case 422:
            return 'A API rejeitou um ou mais campos enviados';
        default:
            return `Falha na API(HTTP ${error.status}).`;
    }
}