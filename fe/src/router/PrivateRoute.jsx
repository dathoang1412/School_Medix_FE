import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

const PrivateRoute = ({ allowedRoles, currentRole }) => {
  const navigate = useNavigate();

  useEffect(() => {

    console.log("allowed Role: " + allowedRoles);
    console.log("current Role: ", currentRole);
    console.log("Current user: ", JSON.parse(localStorage.getItem("user")))

    if (!currentRole) {
      enqueueSnackbar("Bạn cần phải đăng nhập", { variant: "error" });
      navigate("/");
    } else if (allowedRoles !== currentRole) {
      enqueueSnackbar("Bạn cần phải đăng nhập với tư cách " + allowedRoles, {
        variant: "error",
      });
      navigate("/");
    }
  }, [allowedRoles, currentRole, navigate]);

  if (!currentRole || allowedRoles !== currentRole) {
    return () => {
        navigate('/')
    }; // hoặc loading, hoặc redirect
  }

  return <Outlet />;
};

export default PrivateRoute;
