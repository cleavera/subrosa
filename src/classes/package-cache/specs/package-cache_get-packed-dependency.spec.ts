import { ILogger, IPromiseResolver } from '@cleavera/types';
import { createFunctionSpy, Expect, ISpiedFunction, Setup, Test, TestCase, TestFixture } from 'alsatian';
import { hashElement } from 'folder-hash';
import { join } from 'path';

import { INJECTOR } from '../../../constants/injector.constant';
import { IStub } from '../../../interfaces/stub.interface';
import { HashElementStubFactory } from '../../../providers/hash-element/hash-element.stub';
import { HASH_ELEMENT_TOKEN } from '../../../providers/hash-element/hash-element.token';
import { LoggerStubFactory } from '../../../providers/logger/logger.stub';
import { LOGGER_TOKEN } from '../../../providers/logger/logger.token';
import { FileService } from '../../file-service/file-service';
import { FileServiceStubFactory } from '../../file-service/file-service.stub';
import { FILE_SERVICE_TOKEN } from '../../file-service/file-service.token';
import { NpmService } from '../../npm-service/npm-service';
import { NpmServiceStubFactory } from '../../npm-service/npm-service.stub';
import { NPM_SERVICE_TOKEN } from '../../npm-service/npm-service.token';
import { PackageCache } from '../package-cache';

@TestFixture('PackageCache.hashPackage')
export class PackageCacheGetPackedDependencySpec {
    private _fileService!: IStub<FileService>;
    private _hashElement!: ISpiedFunction<typeof hashElement>;
    private _logger!: IStub<ILogger>;
    private _npmService!: IStub<NpmService>;
    private _packageCache!: PackageCache;

    @Setup
    public setup(): void {
        this._fileService = FileServiceStubFactory();
        this._npmService = NpmServiceStubFactory();
        this._hashElement = HashElementStubFactory();
        this._logger = LoggerStubFactory();

        INJECTOR.setValue(FILE_SERVICE_TOKEN, this._fileService);
        INJECTOR.setValue(NPM_SERVICE_TOKEN, this._npmService);
        INJECTOR.setValue(HASH_ELEMENT_TOKEN, this._hashElement);
        INJECTOR.setValue(LOGGER_TOKEN, this._logger);

        this._packageCache = new PackageCache();
    }

    @TestCase('./this-folder', 'test-package', 'dfuyhf98df', true)
    @TestCase('./this-folder', 'test-package', 'dfuyhf98df', false)
    @Test('It should return a cached package')
    public async getCachedPackedDependency(path: string, packageName: string, hash: string, cached: boolean): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cacheDirectory: string = (PackageCache as any)._CACHE_DIRECTORY;
        const expectedOutPath: string = join(cacheDirectory, `./${hash}.tgz`);
        let resolveExists: IPromiseResolver<boolean> | null = null;
        let resolvePack: IPromiseResolver<void> | null = null;
        let resolveHashElement: IPromiseResolver<{ hash: { toString(): string; }; }> | null = null;

        this._fileService.createDir.andReturn(Promise.resolve());

        this._hashElement.andReturn(new Promise((resolve: IPromiseResolver<{ hash: { toString(): string; }; }>) => {
            resolveHashElement = resolve;
        }));

        this._fileService.exists.andReturn(new Promise((resolve: IPromiseResolver<boolean>) => {
            resolveExists = resolve;
        }));

        this._npmService.pack.andReturn(new Promise((resolve: IPromiseResolver<void>) => {
            resolvePack = resolve;
        }));

        const cachedFilePath: Promise<string> = this._packageCache.getPackedDependency(path, packageName);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Expect(this._fileService.createDir).toHaveBeenCalledWith(cacheDirectory);

        await Promise.resolve();

        Expect(this._hashElement.calls[0].args).toEqual([
            path,
            {
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
            }
        ]);

        const toStringSpy: ISpiedFunction<() => string> = createFunctionSpy();

        toStringSpy.andReturn(hash);

        (resolveHashElement as unknown as IPromiseResolver<{ hash: { toString(): string; }; }>)({
            hash: {
                toString: toStringSpy
            }
        });

        await Promise.resolve();
        await Promise.resolve();

        Expect(this._fileService.exists).toHaveBeenCalledWith(expectedOutPath);

        (resolveExists as unknown as IPromiseResolver<boolean>)(cached);

        await Promise.resolve();

        if (cached) {
            Expect(this._npmService.pack).not.toHaveBeenCalled();
            Expect(this._logger.info).not.toHaveBeenCalled();
        } else {
            Expect(this._npmService.pack).toHaveBeenCalledWith(expectedOutPath, path);
            Expect(this._logger.info).toHaveBeenCalledWith(`Packing ${packageName}`);

            (resolvePack as unknown as IPromiseResolver<void>)();

            await Promise.resolve();
        }

        Expect(await cachedFilePath).toEqual(expectedOutPath);
    }
}
