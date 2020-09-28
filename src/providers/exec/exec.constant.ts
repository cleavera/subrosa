import { exec } from 'child_process';
import { promisify } from 'util';

import { IExec } from './exec.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EXEC: IExec = promisify(exec) as any;
