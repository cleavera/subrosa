import { createFunctionSpy, ISpiedFunction } from 'alsatian';
import { hashElement } from 'folder-hash';

export function HashElementStubFactory(): ISpiedFunction<typeof hashElement> {
    return createFunctionSpy();
}
