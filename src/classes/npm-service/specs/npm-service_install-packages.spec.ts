import { Expect, ISpiedFunction, Setup, Test, TestCase, TestFixture } from 'alsatian';

import { INJECTOR } from '../../../constants/injector.constant';
import { IStub } from '../../../interfaces/stub.interface';
import { IExec } from '../../../providers/exec/exec.interface';
import { ExecStubFactory } from '../../../providers/exec/exec.stub';
import { EXEC_TOKEN } from '../../../providers/exec/exec.token';
import { FileService } from '../../file-service/file-service';
import { FileServiceStubFactory } from '../../file-service/file-service.spec';
import { FILE_SERVICE_TOKEN } from '../../file-service/file-service.token';
import { NpmService } from '../npm-service';

@TestFixture('NpmService.install')
export class NpmServiceInstallPackagesSpec {
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

    @TestCase('./this-folder', ['package1', 'package2'])
    @Test('It should run an npm install with all the packages')
    public async installPackages(cwd: string, packages: Array<string>): Promise<void> {
        await this._npmService.installPackages(cwd, packages);

        Expect(this._exec.calls[0].args).toEqual([
            `npm i ${packages.join(' ')} --no-save`,
            {
                cwd
            }
        ]);
    }
}
