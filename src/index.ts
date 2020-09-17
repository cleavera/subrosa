import { CONFIG } from './constants/config.constant';
import { INJECTOR } from './constants/injector.constant';
import { CONFIG_TOKEN } from './tokens/config.token';

INJECTOR.setValue(CONFIG_TOKEN, CONFIG);

export { LOGGER } from './constants/logger.constant';
export { Package } from './classes/package';
export { CONFIG };
