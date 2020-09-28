import { Inject, Injectable } from 'avaritia';
import { dirname, join } from 'path';

import { INJECTOR } from '../../constants/injector.constant';
import { IExec } from '../../providers/exec/exec.interface';
import { EXEC_TOKEN } from '../../providers/exec/exec.token';
import { FileService } from '../file-service/file-service';
import { FILE_SERVICE_TOKEN } from '../file-service/file-service.token';
import { NPM_SERVICE_TOKEN } from './npm-service.token';

@Injectable(NPM_SERVICE_TOKEN, INJECTOR)
export class NpmService {
    @Inject(FILE_SERVICE_TOKEN, INJECTOR)
    private readonly _fileService!: FileService;

    @Inject(EXEC_TOKEN, INJECTOR)
    private readonly _exec!: IExec;

    public async install(cwd: string): Promise<void> {
        await this._exec('npm i', {
            cwd
        });
    }

    public async installPackages(cwd: string, packageLocations: Array<string>): Promise<void> {
        await this._exec(`npm i ${packageLocations.join(' ')} --no-save`, {
            cwd
        });
    }

    public async pack(targetFilename: string, packagePath: string): Promise<void> {
        const targetDirectory: string = dirname(targetFilename);
        const { stdout } = await this._exec(`npm pack ${packagePath}`, {
            cwd: targetDirectory
        });

        const outs: Array<string> = stdout.split('\n');
        outs.pop();
        const packedName: string = outs.pop() ?? '';
        await this._fileService.rename(join(targetDirectory, packedName), targetFilename);
    }
}
