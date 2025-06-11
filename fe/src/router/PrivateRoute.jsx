import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const PrivateRoute = ({allowedRoles, currentRole}) => {

    return <Outlet/>

}

export default PrivateRoute
