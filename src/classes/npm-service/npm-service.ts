import { Inject, Injectable } from 'avaritia';
import { exec } from 'child_process';
import { dirname, join } from 'path';
import { promisify } from 'util';

import { INJECTOR } from '../../constants/injector.constant';
import { FILE_SERVICE_TOKEN } from '../../tokens/file-service.token';
import { NPM_SERVICE_TOKEN } from '../../tokens/npm-service.token';
import { FileService } from '../file-service/file-service';

@Injectable(NPM_SERVICE_TOKEN, INJECTOR)
export class NpmService {
    @Inject(FILE_SERVICE_TOKEN, INJECTOR)
    private readonly _fileService!: FileService;

    public async install(cwd: string): Promise<void> {
        await promisify(exec)('npm i', {
            cwd
        });
    }

    public async installPackages(cwd: string, packageLocations: Array<string>): Promise<void> {
        await promisify(exec)(`npm i ${packageLocations.join(' ')} --no-save`, {
            cwd
        });
    }

    public async pack(targetFilename: string, packagePath: string): Promise<void> {
        const targetDirectory: string = dirname(targetFilename);
        const { stdout } = await promisify(exec)(`npm pack ${packagePath}`, {
            cwd: targetDirectory
        });

        const outs: Array<string> = stdout.split('\n');
        outs.pop();
        const packedName: string = outs.pop() ?? '';
        await this._fileService.rename(join(targetDirectory, packedName), targetFilename);
    }
}
