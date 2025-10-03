import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'postgresql',
    dbCredentials: {
        // Replace with your actual Supabase connection string
        url: 'postgresql://postgres:YOLWFGfUiY2ZHxpT@db.notncpmpmgostfxesrvk.supabase.co:5432/postgres'
    },
    schema: './db/schema.ts',
    /**
     * Never edit the migrations directly, only use drizzle.
     * There are scripts in the package.json "db:generate" and "db:migrate" to handle this.
     */
    out: './supabase/migrations'
});