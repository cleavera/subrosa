#!/usr/bin/env node

import { command } from 'yargs';

import { InstallCommand } from './commands/install.command';
import { UpdateCommand } from './commands/update.command';
import { LOGGER } from './providers/logger/logger.constant';
import { setupInjector } from './setup-injector';

setupInjector();

// eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-floating-promises
command(new InstallCommand())
    .command(new UpdateCommand())
    .argv;

process.addListener('unhandledRejection', (reason: unknown): never => {
    LOGGER.error(reason as Error);
    process.exit(1);
});
