export const saveUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
}

export const removeUser = () => {
    localStorage.removeItem("aiMessages");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedChild");
    localStorage.removeItem("access_token");
}

export const getUser = () => {
    return JSON.parse(localStorage.getItem("user"));
}

export const getUserRole = () => {
    return getUser()?.role;
}