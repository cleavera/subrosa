import { ISpiedFunction } from 'alsatian';

export type IStub<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T]: T[K] extends Function ? T[K] & ISpiedFunction<any> : T[K];
}
