import { createFunctionSpy, ISpiedFunction } from 'alsatian';

import { IExec } from './exec.interface';

export function ExecStubFactory(): ISpiedFunction<IExec> {
    return createFunctionSpy();
}
