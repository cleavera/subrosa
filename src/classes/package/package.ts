import { Logger } from '@cleavera/debug';
import { IDict, Maybe } from '@cleavera/types';
import { isNull, throwError } from '@cleavera/utils';
import { Inject } from 'avaritia';
import { basename, join } from 'path';

import { INJECTOR } from '../../constants/injector.constant';
import { CONFIG_TOKEN } from '../../tokens/config.token';
import { FILE_SERVICE_TOKEN } from '../../tokens/file-service.token';
import { LOGGER_TOKEN } from '../../tokens/logger.token';
import { NPM_SERVICE_TOKEN } from '../../tokens/npm-service.token';
import { PACKAGE_CACHE_TOKEN } from '../../tokens/package-cache.token';
import { FileService } from '../file-service/file-service';
import { NpmService } from '../npm-service/npm-service';
import { PackageCache } from '../package-cache/package-cache';

export class Package {
    public name: string;
    public path: string;

    @Inject(LOGGER_TOKEN, INJECTOR)
    private readonly _logger!: Logger;

    @Inject(NPM_SERVICE_TOKEN, INJECTOR)
    private readonly _npmService!: NpmService;

    @Inject(PACKAGE_CACHE_TOKEN, INJECTOR)
    private readonly _packageCache!: PackageCache;

    @Inject(FILE_SERVICE_TOKEN, INJECTOR)
    private readonly _fileService!: FileService;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
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

        await this._npmService.install(this.path);
    }

    public async update(builtList: Set<string> = new Set<string>()): Promise<void> {
        if (builtList.has(this.name)) {
            return;
        }

        builtList.add(this.name);

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

        const packageLocations: Array<string> = await Promise.all(deps.map(async({ path, name }: Package): Promise<string> => {
            return this._packageCache.getPackedDependency(path, name);
        }));

        await this._npmService.installPackages(this.path, packageLocations);
    }

    public async getDependencies(): Promise<Maybe<Array<Package>>> {
        const packageFile: { peerDependencies: IDict<string>; } = await this._fileService.readJsonFile<{ peerDependencies: IDict<string>; }>(join(this.path, './package.json'));

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
