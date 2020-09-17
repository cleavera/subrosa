#!/usr/bin/env node

import { command } from 'yargs';

import { InstallCommand } from './commands/install.command';
import { UpdateCommand } from './commands/update.command';
import { CONFIG } from './constants/config.constant';
import { INJECTOR } from './constants/injector.constant';
import { LOGGER } from './constants/logger.constant';
import { CONFIG_TOKEN } from './tokens/config.token';
import { LOGGER_TOKEN } from './tokens/logger.token';

INJECTOR.setValue(CONFIG_TOKEN, CONFIG);
INJECTOR.setValue(LOGGER_TOKEN, LOGGER);

// eslint-disable-next-line no-unused-expressions
command(new InstallCommand())
    .command(new UpdateCommand())
    .argv;

process.addListener('unhandledRejection', (reason: unknown): never => {
    LOGGER.error(reason as Error);
    process.exit(1);
});
