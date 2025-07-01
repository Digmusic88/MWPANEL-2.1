"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => {
    const url = process.env.DATABASE_URL;
    if (url) {
        const dbUrl = new URL(url);
        return {
            type: 'postgres',
            host: dbUrl.hostname,
            port: parseInt(dbUrl.port, 10) || 5432,
            username: dbUrl.username,
            password: dbUrl.password,
            name: dbUrl.pathname.slice(1),
        };
    }
    return {
        type: 'postgres',
        host: process.env.DB_HOST || 'postgres',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_USER || 'mwpanel',
        password: process.env.DB_PASSWORD || 'mwpanel123',
        name: process.env.DB_NAME || 'mwpanel',
    };
});
//# sourceMappingURL=database.config.js.map