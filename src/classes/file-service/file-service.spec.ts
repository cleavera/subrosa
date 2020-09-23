/* eslint-disable max-classes-per-file,@typescript-eslint/no-explicit-any */
import { Expect, Setup, Test, TestCase, TestFixture } from 'alsatian';
import { promises } from 'fs';

import { INJECTOR } from '../../constants/injector.constant';
import { IStub } from '../../interfaces/stub.interface';
import { FsStubFactory } from '../../providers/fs/fs.stub';
import { FS_TOKEN } from '../../providers/fs/fs.token';
import { FileService } from './file-service';

@TestFixture('FileService.exists')
export class FileServiceExistsSpec {
    private _fileService!: FileService;
    private _fsStub!: Partial<IStub<typeof promises>>;

    @Setup
    public setup(): void {
        this._fsStub = FsStubFactory();

        INJECTOR.setValue(FS_TOKEN, this._fsStub);

        this._fileService = new FileService();
    }

    @TestCase('./filePath.test.txt')
    @Test('When the file exists It should return true')
    public async exists(path: string): Promise<void> {
        this._fsStub.access.andReturn(Promise.resolve());

        const returnValue: boolean = await this._fileService.exists(path);

        Expect(returnValue).toBe(true);
        Expect(this._fsStub.access).toHaveBeenCalledWith(path);
    }

    @TestCase('./filePath.test.txt')
    @Test('When the file does not exist It should return false')
    public async notExists(path: string): Promise<void> {
        const error: Error = new Error('No entity');
        (error as any).code = 'ENOENT';

        this._fsStub.access.andReturn(Promise.reject(error));

        const returnValue: boolean = await this._fileService.exists(path);

        Expect(returnValue).toBe(false);
        Expect(this._fsStub.access).toHaveBeenCalledWith(path);
    }

    @TestCase('./filePath.test.txt')
    @Test('When the file access throws an error It rethrow the error')
    public async accessError(path: string): Promise<void> {
        const error: Error = new Error('Bad access');

        this._fsStub.access.andReturn(Promise.reject(error));

        try {
            await this._fileService.exists(path);

            Expect('Error threw').toBe('true');
        } catch (e) {
            Expect(e).toBe(error);
            Expect(this._fsStub.access).toHaveBeenCalledWith(path);
        }
    }
}

@TestFixture('FileService.createDir')
export class FileServiceCreateDirSpec {
    private _fileService!: FileService;
    private _fsStub!: Partial<IStub<typeof promises>>;

    @Setup
    public setup(): void {
        this._fsStub = FsStubFactory();

        INJECTOR.setValue(FS_TOKEN, this._fsStub);

        this._fileService = new FileService();
    }

    @TestCase('./directory')
    @Test('When the directory does not exist It should create the directory')
    public async notExists(path: string): Promise<void> {
        this._fsStub.mkdir.andReturn(Promise.resolve());
        await this._fileService.createDir(path);

        Expect(this._fsStub.mkdir).toHaveBeenCalledWith(path);
    }

    @TestCase('./directory')
    @Test('When the directory already exists It should not error')
    public async exists(path: string): Promise<void> {
        const error: Error = new Error();
        (error as any).code = 'EEXIST';

        this._fsStub.mkdir.andReturn(Promise.reject(error));
        await this._fileService.createDir(path);

        Expect(this._fsStub.mkdir).toHaveBeenCalledWith(path);
    }

    @TestCase('./directory')
    @Test('When the directory creation errors It should throw the error')
    public async errored(path: string): Promise<void> {
        const error: Error = new Error();

        this._fsStub.mkdir.andReturn(Promise.reject(error));

        try {
            await this._fileService.createDir(path);

            Expect('Error threw').toBe('true');
        } catch (e) {
            Expect(e).toBe(error);
            Expect(this._fsStub.mkdir).toHaveBeenCalledWith(path);
        }
    }
}

@TestFixture('FileService.rename')
export class FileServiceRenameSpec {
    private _fileService!: FileService;
    private _fsStub!: Partial<IStub<typeof promises>>;

    @Setup
    public setup(): void {
        this._fsStub = FsStubFactory();

        INJECTOR.setValue(FS_TOKEN, this._fsStub);

        this._fileService = new FileService();
    }

    @TestCase('oldName', 'newName')
    @Test('It should rename the file')
    public async rename(oldName: string, newName: string): Promise<void> {
        await this._fileService.rename(oldName, newName);

        Expect(this._fsStub.rename).toHaveBeenCalledWith(oldName, newName);
    }
}

@TestFixture('FileService.readFile')
export class FileServiceReadFileSpec {
    private _fileService!: FileService;
    private _fsStub!: Partial<IStub<typeof promises>>;

    @Setup
    public setup(): void {
        this._fsStub = FsStubFactory();

        INJECTOR.setValue(FS_TOKEN, this._fsStub);

        this._fileService = new FileService();
    }

    @TestCase('./filePath.test.txt', 'returned string')
    @Test('It should read the file')
    public async readFile(path: string, fileContents: string): Promise<void> {
        this._fsStub.readFile.andReturn(Promise.resolve(fileContents));

        const returnValue: string = await this._fileService.readFile(path);

        Expect(returnValue).toBe(fileContents);
        Expect(this._fsStub.readFile.calls[0].args).toEqual([
            path,
            {
                encoding: 'utf-8'
            }
        ]);
    }
}

@TestFixture('FileService.readJSONFile')
export class FileServiceReadJsonFileSpec {
    private _fileService!: FileService;
    private _fsStub!: Partial<IStub<typeof promises>>;

    @Setup
    public setup(): void {
        this._fsStub = FsStubFactory();

        INJECTOR.setValue(FS_TOKEN, this._fsStub);

        this._fileService = new FileService();
    }

    @TestCase('./filePath.test.txt', '{ "property": "returned string" }')
    @Test('It should read the file as json')
    public async readFile(path: string, fileContents: string): Promise<void> {
        this._fsStub.readFile.andReturn(Promise.resolve(fileContents));

        const returnValue: string = await this._fileService.readJsonFile(path);

        Expect(this._fsStub.readFile.calls[0].args).toEqual([
            path,
            {
                encoding: 'utf-8'
            }
        ]);
        Expect(returnValue).toEqual(JSON.parse(fileContents));
    }
}
