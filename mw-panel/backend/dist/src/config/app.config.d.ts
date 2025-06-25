declare const _default: (() => {
    nodeEnv: string;
    port: number;
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        origin: string;
    };
    admin: {
        email: string;
        password: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        origin: string;
    };
    admin: {
        email: string;
        password: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
}>;
export default _default;
