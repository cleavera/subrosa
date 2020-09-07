import { IDict } from '@cleavera/types';
import { readFile } from 'fs';
import { dirname } from 'path';
import { promisify } from 'util';

export class Package {
    public name: string;
    public path: string;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
    }

    public static async FromPackageJSONPath(path: string): Promise<Package> {
        const packageInformation: IDict<string> = JSON.parse(await promisify(readFile)(path, {
            encoding: 'utf-8'
        }));

        return new Package(packageInformation.name, dirname(path));
    }
}
