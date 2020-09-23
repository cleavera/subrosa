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

export class UpdateCommand implements CommandModule<{}, IArgs> {
    public command: string = 'update';
    public describe: string = 'Runs through the dependency tree and updates them in order';

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

        await pkg.update();
    }
}
