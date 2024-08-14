import express, {type Express} from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import {TContextCreator} from '../trpc/context.mjs';
import {appRouter} from '../trpc/routers/index.mjs';
import {env} from '../../env.mjs';
import {createProfilePictureHandler} from './handlers/users/picture.mjs';
import {createPetitionAttachmentHandler} from './handlers/petitions/attachment.mjs';

export async function registerHTTPRoutes(
    expressApp: Express,
    createContext: TContextCreator,
) {
    const app = expressApp;

    app.get('/', (req, res) => {
        res.json({
            message: 'HELLO FROM jonogon-core!',
        });
    });

    app.use(
        '/trpc',
        trpcExpress.createExpressMiddleware({
            router: appRouter,
            createContext,
        }),
    );

    app.post(
        '/petitions/:id/attachments',
        express.raw({
            inflate: true,
            limit: 16 * 1024 * 1024,
        }),
        createPetitionAttachmentHandler(createContext),
    );

    app.put(
        '/users/self/picture',
        express.raw({
            inflate: true,
            limit: 16 * 1024 * 1024,
        }),
        createProfilePictureHandler(createContext),
    );

    if (env.NODE_ENV === 'development') {
        app.use('/static/', express.static('/jonogon-static/'));

        const trpcPlayground = await import('trpc-playground/handlers/express');

        app.use(
            '/trpc-playground',
            await trpcPlayground.expressHandler({
                trpcApiEndpoint: '/trpc',
                playgroundEndpoint: '/trpc-playground',
                router: appRouter,
            }),
        );
    }
}
