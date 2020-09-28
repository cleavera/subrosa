import { Expect, Setup, Test, TestCase, TestFixture } from 'alsatian';
import { promises } from 'fs';

import { INJECTOR } from '../../../constants/injector.constant';
import { IStub } from '../../../interfaces/stub.interface';
import { FsStubFactory } from '../../../providers/fs/fs.stub';
import { FS_TOKEN } from '../../../providers/fs/fs.token';
import { FileService } from '../file-service';

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
