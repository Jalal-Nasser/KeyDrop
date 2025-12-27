import { bootstrap } from '@vendure/core';
import { config } from './vendure-config';

bootstrap(config).then(() => {
    console.log('Vendure server started!');
    console.log('Admin API: http://localhost:3001/admin-api');
    console.log('Shop API:  http://localhost:3001/shop-api');
    console.log('Admin UI:  http://localhost:3002/admin');
}).catch(err => {
    console.log(err);
});
