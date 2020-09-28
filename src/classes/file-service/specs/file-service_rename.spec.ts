import { Expect, Setup, Test, TestCase, TestFixture } from 'alsatian';
import { promises } from 'fs';

import { INJECTOR } from '../../../constants/injector.constant';
import { IStub } from '../../../interfaces/stub.interface';
import { FsStubFactory } from '../../../providers/fs/fs.stub';
import { FS_TOKEN } from '../../../providers/fs/fs.token';
import { FileService } from '../file-service';

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
