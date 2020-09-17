import { ConsoleLoggerFactory, Logger } from '@cleavera/debug';

import { LOGGER_TOKEN } from '../tokens/logger.token';
import { INJECTOR } from './injector.constant';

const LOGGER: Logger = ConsoleLoggerFactory();

INJECTOR.setValue(LOGGER_TOKEN, LOGGER);

export { LOGGER };
