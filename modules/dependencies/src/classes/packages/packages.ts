import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';
import * as glob from 'glob';
import { promisify } from 'util';

import { Package } from '../package/package';

export class Packages {
    public packages: Array<Package>;

    constructor(packages: Array<Package>) {
        this.packages = packages;
    }

    public static async GetAll(): Promise<Maybe<Packages>> {
        const paths: Maybe<Array<string>> = await promisify(glob)('./**/package.json');

        if (isNull(paths)) {
            return null;
        }

        return new Packages(await Promise.all(paths.map(async(path: string) => {
            return Package.FromPackageJSONPath(path);
        })));
    }
}
