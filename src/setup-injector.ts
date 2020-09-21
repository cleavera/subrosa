import { CONFIG } from './constants/config.constant';
import { EXEC } from './constants/exec.constant';
import { FS } from './constants/fs.constant';
import { INJECTOR } from './constants/injector.constant';
import { LOGGER } from './constants/logger.constant';
import { CONFIG_TOKEN } from './tokens/config.token';
import { EXEC_TOKEN } from './tokens/exec.token';
import { FS_TOKEN } from './tokens/fs.token';
import { LOGGER_TOKEN } from './tokens/logger.token';

export function setupInjector(): void {
    INJECTOR.setValue(CONFIG_TOKEN, CONFIG);
    INJECTOR.setValue(LOGGER_TOKEN, LOGGER);
    INJECTOR.setValue(FS_TOKEN, FS);
    INJECTOR.setValue(EXEC_TOKEN, EXEC);
}
