export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";
export const USER_ROLE = "userRole";
export const USER_PROFILE = "userProfile";

export const ORDER_STATUS_OPTIONS = [
    { value: "RECEIVED", label: "Order Received" },
    { value: "PREPARING", label: "Preparing" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
];

export const ROLE_LABELS = {
    super_admin: "Super Admin",
    employee: "Employee",
    cook: "Cook",
    student: "Student",
};