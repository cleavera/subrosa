import { Expect, Setup, Test, TestCase, TestFixture } from 'alsatian';
import { promises } from 'fs';

import { INJECTOR } from '../../../constants/injector.constant';
import { IStub } from '../../../interfaces/stub.interface';
import { FsStubFactory } from '../../../providers/fs/fs.stub';
import { FS_TOKEN } from '../../../providers/fs/fs.token';
import { FileService } from '../file-service';

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
