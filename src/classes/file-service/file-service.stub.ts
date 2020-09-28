import { createFunctionSpy } from 'alsatian';

import { IStub } from '../../interfaces/stub.interface';
import { FileService } from './file-service';

export function FileServiceStubFactory(): IStub<FileService> {
    return {
        createDir: createFunctionSpy(),
        exists: createFunctionSpy(),
        rename: createFunctionSpy(),
        readFile: createFunctionSpy(),
        readJsonFile: createFunctionSpy()
    };
}
