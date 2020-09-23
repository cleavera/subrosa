import { throwError } from '@cleavera/utils';
import { join } from 'path';
import { CommandBuilder, CommandModule } from 'yargs';

import { Package } from '../classes/package/package';
import { INJECTOR } from '../constants/injector.constant';
import { CONFIG_TOKEN } from '../providers/config/config.token';

interface IArgs {
    prefix: string;
    root: string;
}

export class InstallCommand implements CommandModule<{}, IArgs> {
    public command: string = 'installAll';
    public describe: string = 'Runs through all this packages dependencies and makes sure they have all run install';

    public builder: CommandBuilder<{}, IArgs> = {
        prefix: {
            type: 'string',
            describe: 'The prefix for packages inside this repo',
            demandOption: true
        },
        root: {
            type: 'string',
            describe: 'The root of the repository',
            demandOption: true
        }
    };

    public async handler({ prefix, root }: IArgs): Promise<void> {
        const config: Map<string, string> = INJECTOR.get<Map<string, string>>(CONFIG_TOKEN) ?? throwError(new Error('No config found in injector'));
        config.set('prefix', prefix);
        config.set('root', join(process.cwd(), root));

        const pkg: Package = await Package.FromPath(process.cwd());

        await pkg.install();
    }
}
