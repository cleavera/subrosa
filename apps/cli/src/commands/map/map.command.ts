import { IDict } from '@cleavera/types';
import { Packages } from '@subrosa/dependencies';

export async function mapCommand(args: IDict<any>) {
    console.log(await Packages.GetAll());
}
