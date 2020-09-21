import { Inject, Injectable } from 'avaritia';
import { promises as fs } from 'fs';

import { INJECTOR } from '../../constants/injector.constant';
import { FILE_SERVICE_TOKEN } from '../../tokens/file-service.token';
import { FS_TOKEN } from '../../tokens/fs.token';

@Injectable(FILE_SERVICE_TOKEN, INJECTOR)
export class FileService {
    @Inject(FS_TOKEN, INJECTOR)
    private readonly _fs!: typeof fs;

    public async exists(filePath: string): Promise<boolean> {
        try {
            await this._fs.access(filePath);

            return true;
        } catch (e) {
            if (e.code === 'ENOENT') {
                return false;
            }

            throw e;
        }
    }

    public async createDir(dir: string): Promise<void> {
        try {
            await this._fs.mkdir(dir);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }
    }

    public async rename(oldPath: string, newPath: string): Promise<void> {
        await this._fs.rename(oldPath, newPath);
    }

    public async readFile(path: string): Promise<string> {
        return this._fs.readFile(path, {
            encoding: 'utf-8'
        });
    }

    public async readJsonFile<T>(path: string): Promise<T> {
        return JSON.parse(await this.readFile(path));
    }
}
