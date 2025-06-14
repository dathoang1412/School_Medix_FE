import { Outlet } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";

const UserManagement = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default UserManagement;
