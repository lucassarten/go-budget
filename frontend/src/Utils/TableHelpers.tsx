import { ent } from "../../wailsjs/go/models";

export function isEmptyPinnedCell(params: any) {
    return (
        (params.node.rowPinned === 'top' && params.value == null) ||
        (params.node.rowPinned === 'top' && params.value == '')
    );
}

export function createPinnedCellPlaceholder(params: any) {
    return params.colDef.field[0].toUpperCase() + params.colDef.field.slice(1) + '...';
}

export function isRowDataCompleted(colDefs: any, inputRow: any) {
    if (!inputRow) return;
    return colDefs.every((def: { field: string; }) => {
        if (!def.field) return true
        return inputRow[def.field as keyof ent.Transaction] !== undefined
    });
}

// validation functions

export function validateRequired(value: string) { return !!value.length };

export function validateDate(value: number){
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
};

export function validateAmount(value: string){
    const number = Number(value);
    return !Number.isNaN(number);
};

export function validatePositiveAmount(value: string){
    const number = Number(value);
    return !Number.isNaN(number) && number >= 0;
};


export function validateColour(value: string){
    const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return regex.test(value);
}