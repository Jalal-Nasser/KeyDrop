import { VendureConfig, DefaultJobQueuePlugin, DefaultSearchPlugin, dummyPaymentHandler } from '@vendure/core';
// import { defaultEmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import path from 'path';
import 'dotenv/config';

// Helper to parse DATABASE_URL
function getDbConfig() {
    if (process.env.DATABASE_URL) {
        try {
            const url = new URL(process.env.DATABASE_URL);
            return {
                type: 'postgres' as const,
                host: url.hostname,
                port: parseInt(url.port || '5432'),
                username: url.username,
                password: url.password,
                database: url.pathname.substring(1), // Remove leading slash
                ssl: { rejectUnauthorized: false }, // Required for Neon/AWS
                synchronize: true,
                logging: false,
            };
        } catch (e) {
            console.error('Failed to parse DATABASE_URL, falling back to env vars');
        }
    }

    return {
        type: (process.env.DB_TYPE as any) || 'postgres',
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: false,
        database: process.env.DB_NAME || 'neondb',
        host: process.env.DB_HOST || 'localhost',
        port: +(process.env.DB_PORT || 5432),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
}

export const config: VendureConfig = {
    apiOptions: {
        port: +(process.env.PORT || 3001),
        adminApiPath: 'admin-api',
        shopApiPath: '', // Shop API at root domain
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:3001',
                'https://dropskey.com',
                'https://m.dropskey.com',
                process.env.STORE_URL || ''
            ].filter(Boolean),
            credentials: true,
        },
    },
    authOptions: {
        tokenMethod: 'bearer',
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME || 'superadmin',
            password: process.env.SUPERADMIN_PASSWORD || 'superadmin',
        },
        cookieOptions: {
            secret: process.env.COOKIE_SECRET || 'fallback-dev-secret',
        },
    },
    dbConnectionOptions: getDbConfig(),
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    customFields: {},
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: process.env.ASSET_UPLOAD_DIR || path.join(__dirname, '../static/assets'),
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        // EmailPlugin is temporarily disabled
        AdminUiPlugin.init({
            route: 'admin',
            port: +(process.env.ADMIN_UI_PORT || 3002),
        }),
    ],
};
