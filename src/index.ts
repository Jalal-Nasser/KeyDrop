import { bootstrap } from '@vendure/core';
import { config } from './vendure-config';

bootstrap(config).then(() => {
    console.log('Vendure server started!');
    console.log(`Shop API:  http://localhost:${config.apiOptions.port}/${config.apiOptions.shopApiPath}`);
    console.log(`Admin API: http://localhost:${config.apiOptions.port}/${config.apiOptions.adminApiPath}`);
    console.log(`Admin UI:  http://localhost:${config.apiOptions.port}/admin`);
}).catch(err => {
    console.log(err);
});
