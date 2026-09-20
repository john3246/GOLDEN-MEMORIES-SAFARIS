export function isStaffAdmin(user) {
  const role = user?.role || user;
  return role === 'Admin' || role === 'Super Admin';
}
