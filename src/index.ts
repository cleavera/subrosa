import { CONFIG } from './constants/config.constant';
import { INJECTOR } from './constants/injector.constant';
import { LOGGER } from './constants/logger.constant';
import { CONFIG_TOKEN } from './tokens/config.token';
import { LOGGER_TOKEN } from './tokens/logger.token';

INJECTOR.setValue(CONFIG_TOKEN, CONFIG);
INJECTOR.setValue(LOGGER_TOKEN, LOGGER);

export { Package } from './classes/package';
export { LOGGER };
export { CONFIG };
