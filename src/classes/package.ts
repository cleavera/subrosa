import { Logger } from '@cleavera/debug';
import { IDict, Maybe } from '@cleavera/types';
import { isNull, throwError } from '@cleavera/utils';
import { exec } from 'child_process';
import { hashElement, HashElementNode } from 'folder-hash';
import { promises as fs } from 'fs';
import { basename, join } from 'path';
import { promisify } from 'util';

import { INJECTOR } from '../constants/injector.constant';
import { CONFIG_TOKEN } from '../tokens/config.token';
import { LOGGER_TOKEN } from '../tokens/logger.token';

export class Package {
    public name: string;
    public path: string;

    private readonly _logger: Logger;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;

        this._logger = INJECTOR.get<Logger>(LOGGER_TOKEN) ?? throwError(new Error('No logger registered'));
    }

    public async install(installedList: Array<string> = []): Promise<void> {
        if (installedList.includes(this.name)) {
            return;
        }

        installedList.push(this.name);

        const deps: Array<Package> = await this.getDependencies() ?? [];

        for (const dep of deps) {
            await dep.install(installedList);
        }

        this._logger.info(`Installing ${this.name}`);

        await promisify(exec)('npm i', {
            cwd: this.path
        });
    }

    public async hash(): Promise<string> {
        const hashElementNode: HashElementNode = await hashElement(this.path, {
            folders: {
                exclude: [
                    'node_modules',
                    'dist'
                ]
            },
            files: {
                include: [
                    '*.ts',
                    'package.json'
                ]
            },
            encoding: 'hex'
        });

        return hashElementNode.hash.toString();
    }

    public async update(builtList: Array<string> = []): Promise<void> {
        if (builtList.includes(this.name)) {
            return;
        }

        builtList.push(this.name);

        const deps: Maybe<Array<Package>> = await this.getDependencies();

        if (isNull(deps)) {
            return;
        }

        for (const dep of deps) {
            await dep.update(builtList);
        }

        this._logger.info(`Updating local dependencies for ${this.name} [${deps.map((dep: Package) => {
            return dep.name;
        }).join(', ')}]`);

        const outDir: string = join(__dirname, '../.cache');

        try {
            await fs.mkdir(outDir);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }

        const packageLocations: Array<string> = [];

        for (const dep of deps) {
            const hash: string = await dep.hash();
            const outFile: string = join(outDir, `${hash}.tgz`);

            packageLocations.push(outFile);

            try {
                await fs.access(outFile);
            } catch (e) {
                this._logger.info(`Packing ${dep.name}`);
                await this._packDependency(outDir, dep.path, outFile);
            }
        }

        await promisify(exec)(`npm i ${packageLocations.join(' ')} --no-save`, {
            cwd: this.path
        });
    }

    public async getDependencies(): Promise<Maybe<Array<Package>>> {
        const packageFile: { peerDependencies: IDict<string>; } = JSON.parse(await fs.readFile(join(this.path, './package.json'), {
            encoding: 'utf-8'
        }));

        const packages: Array<Package> = [];

        for (const dependency of Object.keys(packageFile.peerDependencies ?? {})) {
            if (dependency.startsWith(Package._getPrefix())) {
                packages.push(await Package.FromName(dependency));
            }
        }

        if (!packages.length) {
            return null;
        }

        return packages;
    }

    private async _packDependency(cacheDirectory: string, packagePath: string, targetFilename: string): Promise<void> {
        const { stdout } = await promisify(exec)(`npm pack ${packagePath}`, {
            cwd: cacheDirectory
        });
        const outs: Array<string> = stdout.split('\n');
        outs.pop();
        const packedName: string = outs.pop() ?? '';
        await fs.rename(join(cacheDirectory, packedName), targetFilename);
    }

    public static async FromName(name: string): Promise<Package> {
        const [, folder] = name.split('/');
        const path: string = join(this._getRoot(), './packages', folder);

        return new Package(name, path);
    }

    public static async FromPath(path: string): Promise<Package> {
        const folderName: string = basename(path);

        return new Package(`${this._getPrefix()}/${folderName}`, path);
    }

    private static _getConfig(): Map<string, string> {
        return INJECTOR.get<Map<string, string>>(CONFIG_TOKEN) ?? throwError(new Error('No config in the injector'));
    }

    private static _getPrefix(): string {
        const config: Map<string, string> = this._getConfig();
        const prefix: string = config.get('prefix') ?? throwError(new Error('No prefix on the config'));

        return `@${prefix}`;
    }

    private static _getRoot(): string {
        const config: Map<string, string> = this._getConfig();

        return config.get('root') ?? throwError(new Error('No root on the config'));
    }
}
