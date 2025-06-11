import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from '../pages/HomePage'
import Login from "../pages/Auth/Login";
import PrivateRoute from "./PrivateRoute";
import AdminLayout from "../layouts/AdminLayout";
import SendDrugManagement from "../pages/Admin/SendDrugManagement";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ParentDashboard from "../pages/Parent/ParentDashboard";
import SendDrugManagementNurse from "../pages/Nurse/SendDrugManagementNurse";
import NurseDashboard from "../pages/Nurse/NurseDashboard";
import ParentLayout from "../layouts/ParentLayout";
import SendDrug from "../pages/Parent/SendDrug";
import SendDrugForm from "../pages/Parent/SendDrugForm";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true, 
        element: <HomePage/>,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
  {
    path: "/admin",
    element: <PrivateRoute allowedRoles={["admin"]} currentRole={"admin"}/>,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "",
            element: <AdminDashboard />,
          },
          {
            path: "send-drug",
            element: <SendDrugManagement />,
          },
        ],
      },
    ],
  },
  {
    path: "/parent", 
    element: <PrivateRoute allowedRoles={["parent"]} currentRole={"parent"}/>,
    children: [
       {
        path: "/parent",
        element: <ParentLayout />,
        children: [
          {
            path: '',
            element: <ParentDashboard/>
          },
          {
            path: 'send-drug',
            element: <SendDrug/>
          },
          {
            path: 'send-drug-form',
            element: <SendDrugForm/>
          }
        ]
       } 
    ]
  },
  {
    path: "/nurse",
    element: <PrivateRoute allowedRoles={["nurse"]} currentRole={"nurse"}/>,
    children: [
      {
        path: "/nurse",
        element: <AdminLayout/>,
        children: [
          {
            path: "",
            element: <NurseDashboard/>
          },
          {
            path: "send-drug",
            element: <SendDrugManagementNurse />,
          }
        ]
      }
    ]
  }
]);

export default routes;