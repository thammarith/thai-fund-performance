import { Cached } from '../types/Cached.ts';

interface ReadFileOptions {
    silent?: boolean;
}

export const readFile = async <T>(path: string, target?: string, options?: ReadFileOptions): Promise<Awaited<Cached<T> | undefined>> => {
    if (!options?.silent) console.log(`Reading ${target} from ${path}`);
    try {
        return JSON.parse(await Deno.readTextFile(path)) as Awaited<Cached<T>>;
    } catch (err) {
        console.error(`Cannot read [${target}] from ${path}`);

        switch (err.name) {
            case 'NotFound':
                console.error('File not found');
                break;
            default:
                console.error(err);
        }

        return undefined;
    }
};

interface WriteFileProps {
    path: string;
    data: object;
    nextUpdate?: Date;
}

export const writeFile = async ({ path, data, nextUpdate }: WriteFileProps): Promise<Awaited<boolean>> => {
    try {
        await Deno.writeTextFile(
            path,
            JSON.stringify({
                lastUpdate: new Date().valueOf(),
                nextUpdate: nextUpdate?.valueOf(),
                data,
            }, null, 4),
            {
                create: true,
            }
        );

        return true;
    } catch (err) {
        switch (err.name) {
            default:
                console.error(err);
        }

        return false;
    }
};
