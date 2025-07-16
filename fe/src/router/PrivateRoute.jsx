import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { getUserRole } from "../service/authService";

const PrivateRoute = ({ allowedRoles }) => {
  const navigate = useNavigate();

  useEffect(() => {

    console.log("allowed Role: " + allowedRoles);
    console.log("current Role: ", getUserRole());
    console.log("Current user: ", JSON.parse(localStorage.getItem("user")))

    if (!getUserRole()) {
      enqueueSnackbar("Bạn cần phải đăng nhập", { variant: "error" });
      navigate("/");
    } else if (allowedRoles !== getUserRole()) {
      enqueueSnackbar("Bạn cần phải đăng nhập với tư cách " + allowedRoles, {
        variant: "error",
      });
      navigate("/");
    }
  }, [allowedRoles, getUserRole(), navigate]);

  if (!getUserRole() || allowedRoles !== getUserRole()) {
    return () => {
        navigate('/')
    }; // hoặc loading, hoặc redirect
  }

  return <Outlet />;
};

export default PrivateRoute;
