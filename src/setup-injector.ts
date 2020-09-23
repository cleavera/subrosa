import { INJECTOR } from './constants/injector.constant';
import { CONFIG } from './providers/config/config.constant';
import { CONFIG_TOKEN } from './providers/config/config.token';
import { EXEC } from './providers/exec/exec.constant';
import { EXEC_TOKEN } from './providers/exec/exec.token';
import { FS } from './providers/fs/fs.constant';
import { FS_TOKEN } from './providers/fs/fs.token';
import { HASH_ELEMENT } from './providers/hash-element/hash-element.constant';
import { HASH_ELEMENT_TOKEN } from './providers/hash-element/hash-element.token';
import { LOGGER } from './providers/logger/logger.constant';
import { LOGGER_TOKEN } from './providers/logger/logger.token';

export function setupInjector(): void {
    INJECTOR.setValue(CONFIG_TOKEN, CONFIG);
    INJECTOR.setValue(LOGGER_TOKEN, LOGGER);
    INJECTOR.setValue(FS_TOKEN, FS);
    INJECTOR.setValue(EXEC_TOKEN, EXEC);
    INJECTOR.setValue(HASH_ELEMENT_TOKEN, HASH_ELEMENT);
}
