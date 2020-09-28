import { Expect, Setup, Test, TestCase, TestFixture } from 'alsatian';
import { promises } from 'fs';

import { INJECTOR } from '../../../constants/injector.constant';
import { IStub } from '../../../interfaces/stub.interface';
import { FsStubFactory } from '../../../providers/fs/fs.stub';
import { FS_TOKEN } from '../../../providers/fs/fs.token';
import { FileService } from '../file-service';

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
