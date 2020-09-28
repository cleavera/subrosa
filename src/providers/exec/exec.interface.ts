import { ExecOptions } from 'child_process';

export interface IExec {
    (command: string, opts: ExecOptions): Promise<{ stdout: string; stderr: string; }>;
}
