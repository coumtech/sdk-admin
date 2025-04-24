import jwt from 'jsonwebtoken';

export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    const decoded: any = token ? jwt.decode(token) : null;
    return !!(decoded && typeof decoded === 'object' && (decoded as any).exp > Date.now() / 1000);
};