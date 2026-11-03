// The sources import each other without an extension, as the apps' Vite resolves them, so node gets the same rule here
import { register } from 'node:module';

register(
    'data:text/javascript,' +
        encodeURIComponent(`
export async function resolve(specifier, context, next) {
    try {
        return await next(specifier, context);
    } catch (error) {
        if (!specifier.startsWith('.') || /\.[cm]?[jt]s$/.test(specifier)) throw error;
        return next(specifier + '.ts', context);
    }
}
`),
);
