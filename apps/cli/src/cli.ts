#!/usr/bin/env node

import { Asyncable, IDict } from '@cleavera/types';
import * as yargs from 'yargs';

import { mapCommand as map } from './commands/map/map.command';

const { _: [command] } = yargs.argv;

const commands: IDict<(args: any) => Asyncable<unknown>> = {
    map
};

if (command in commands) {
    Promise.resolve(commands[command](yargs.argv)).catch((e: Error) => {
        throw e;
    });
} else {
    throw new Error('No such command');
}
