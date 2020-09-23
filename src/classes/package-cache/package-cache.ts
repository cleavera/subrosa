import { Logger } from '@cleavera/debug';
import { Inject, Injectable } from 'avaritia';
import { hashElement, HashElementNode } from 'folder-hash';
import { join } from 'path';

import { INJECTOR } from '../../constants/injector.constant';
import { HASH_ELEMENT_TOKEN } from '../../providers/hash-element/hash-element.token';
import { LOGGER_TOKEN } from '../../providers/logger/logger.token';
import { FileService } from '../file-service/file-service';
import { FILE_SERVICE_TOKEN } from '../file-service/file-service.token';
import { NpmService } from '../npm-service/npm-service';
import { NPM_SERVICE_TOKEN } from '../npm-service/npm-service.token';
import { PACKAGE_CACHE_TOKEN } from './package-cache.token';

@Injectable(PACKAGE_CACHE_TOKEN, INJECTOR)
export class PackageCache {
    private static readonly _CACHE_DIRECTORY: string = join(__dirname, '../.cache');

    @Inject(LOGGER_TOKEN, INJECTOR)
    private readonly _logger!: Logger;

    @Inject(NPM_SERVICE_TOKEN, INJECTOR)
    private readonly _npmService!: NpmService;

    @Inject(FILE_SERVICE_TOKEN, INJECTOR)
    private readonly _fileService!: FileService;

    @Inject(HASH_ELEMENT_TOKEN, INJECTOR)
    private readonly _hashElement!: typeof hashElement;

    public async getPackedDependency(path: string, packageName: string): Promise<string> {
        await this._fileService.createDir(PackageCache._CACHE_DIRECTORY);

        const hash: string = await this.hashPackage(path);
        const outFile: string = join(PackageCache._CACHE_DIRECTORY, `${hash}.tgz`);

        if (!await this._fileService.exists(outFile)) {
            this._logger.info(`Packing ${packageName}`);
            await this._npmService.pack(outFile, path);
        }

        return outFile;
    }

    public async hashPackage(packagePath: string): Promise<string> {
        const hashElementNode: HashElementNode = await this._hashElement(packagePath, {
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
}
