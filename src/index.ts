import { bootstrap } from '@vendure/core';
import { config } from './vendure-config';

bootstrap(config).then(() => {
    console.log('Vendure server started!');
    console.log(`Shop API:  http://localhost:${config.apiOptions.port}/${config.apiOptions.shopApiPath}`);
    console.log(`Admin API: http://localhost:${config.apiOptions.port}/${config.apiOptions.adminApiPath}`);
    console.log(`Admin UI:  http://localhost:${+(process.env.ADMIN_UI_PORT || 3002)}/admin`);
}).catch(err => {
    console.log(err);
});
