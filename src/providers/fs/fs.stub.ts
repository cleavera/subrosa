import { createFunctionSpy } from 'alsatian';
import { promises } from 'fs';

import { IStub } from '../../interfaces/stub.interface';

export function FsStubFactory(): Partial<IStub<typeof promises>> {
    return {
        access: createFunctionSpy(),
        mkdir: createFunctionSpy(),
        rename: createFunctionSpy(),
        readFile: createFunctionSpy()
    };
}
