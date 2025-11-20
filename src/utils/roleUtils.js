import { ROLE_LABELS } from '../Constants';

export const ROLE_ROUTES = {
    super_admin: '/dashboard',
    employee: '/orders/manage',
    cook: '/orders/manage',
    student: '/shop/cassa',
};

export const getDefaultRouteForRole = (role) => ROLE_ROUTES[role] || '/shop/cassa';

export const getRoleLabel = (role) => ROLE_LABELS[role] || role || 'User';

