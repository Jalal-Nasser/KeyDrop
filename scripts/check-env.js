
require('dotenv').config()

console.log('Checking Environment Variables...')
console.log('DB_TYPE:', process.env.DB_TYPE || 'UNDEFINED (Will default to sqlite)')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'UNDEFINED')
console.log('DB_HOST:', process.env.DB_HOST || 'UNDEFINED')
console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? 'SET' : 'UNDEFINED')
