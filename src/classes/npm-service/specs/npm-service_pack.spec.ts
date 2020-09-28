import { IPromiseResolver } from '@cleavera/types';
import { Expect, ISpiedFunction, Setup, Test, TestCase, TestFixture } from 'alsatian';
import { dirname } from 'path';

import { INJECTOR } from '../../../constants/injector.constant';
import { IStub } from '../../../interfaces/stub.interface';
import { IExec } from '../../../providers/exec/exec.interface';
import { ExecStubFactory } from '../../../providers/exec/exec.stub';
import { EXEC_TOKEN } from '../../../providers/exec/exec.token';
import { FileService } from '../../file-service/file-service';
import { FileServiceStubFactory } from '../../file-service/file-service.stub';
import { FILE_SERVICE_TOKEN } from '../../file-service/file-service.token';
import { NpmService } from '../npm-service';

@TestFixture('NpmService.pack')
export class NpmServicePackSpec {
    private _fileService!: IStub<FileService>;
    private _exec!: ISpiedFunction<IExec>;
    private _npmService!: NpmService;

    @Setup
    public setup(): void {
        this._fileService = FileServiceStubFactory();
        this._exec = ExecStubFactory();

        INJECTOR.setValue(FILE_SERVICE_TOKEN, this._fileService);
        INJECTOR.setValue(EXEC_TOKEN, this._exec);

        this._npmService = new NpmService();
    }

    @TestCase('./target/test.tgz', './source')
    @Test('It should run an npm pack to the correct filepath')
    public async pack(targetFilename: string, folderToPack: string): Promise<void> {
        let resolveExec: IPromiseResolver<{ stdout: string; }> | null = null;

        this._exec.andReturn(new Promise((resolve: IPromiseResolver<{ stdout: string; }>) => {
            resolveExec = resolve;
        }));

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._npmService.pack(targetFilename, folderToPack);

        Expect(this._exec.calls[0].args).toEqual([
            `npm pack ${folderToPack}`,
            {
                cwd: dirname(targetFilename)
            }
        ]);

        (resolveExec as unknown as IPromiseResolver<{ stdout: string; }>)({
            stdout: `test-packed-file.tgz
                test3`
        });

        await Promise.resolve();

        Expect(this._fileService.rename).toHaveBeenCalledWith('target\\test-packed-file.tgz', targetFilename);
    }
}
