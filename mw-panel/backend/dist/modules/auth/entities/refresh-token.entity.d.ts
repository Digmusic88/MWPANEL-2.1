import { User } from '../../users/entities/user.entity';
export declare class RefreshToken {
    id: string;
    token: string;
    user: User;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
    revokedAt: Date;
}
