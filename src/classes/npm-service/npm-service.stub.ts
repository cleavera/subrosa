import { createFunctionSpy } from 'alsatian';

import { IStub } from '../../interfaces/stub.interface';
import { NpmService } from './npm-service';

export function NpmServiceStubFactory(): IStub<NpmService> {
    return {
        install: createFunctionSpy(),
        installPackages: createFunctionSpy(),
        pack: createFunctionSpy()
    };
}
