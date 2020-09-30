import { ILogger } from '@cleavera/types';
import { createFunctionSpy } from 'alsatian';

import { IStub } from '../../interfaces/stub.interface';

export function LoggerStubFactory(): IStub<ILogger> {
    return {
        configure: createFunctionSpy(),
        debug: createFunctionSpy(),
        log: createFunctionSpy(),
        silly: createFunctionSpy(),
        warn: createFunctionSpy(),
        error: createFunctionSpy(),
        info: createFunctionSpy()
    };
}
