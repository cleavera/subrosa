import { Expect, Setup, Test, TestCase, TestFixture } from 'alsatian';
import { promises } from 'fs';

import { INJECTOR } from '../../../constants/injector.constant';
import { IStub } from '../../../interfaces/stub.interface';
import { FsStubFactory } from '../../../providers/fs/fs.stub';
import { FS_TOKEN } from '../../../providers/fs/fs.token';
import { FileService } from '../file-service';

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
