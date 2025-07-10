import axiosClient from "../config/axiosClient";

export const getChildClass = async (id) => {
    try {
        const response = await axiosClient.get('/class/' + id);
        console.log("Class: ", response.data.data[0]);
        return response.data.data[0];
    } catch (error) {
        console.log(error);
    }
}

export const getStudentInfo = async (id) => {
    try {
        const res = await axiosClient.get('/student/' + id)
        console.log("Child Info: ", res?.data.data);
        return res?.data.data;
    } catch (error) {
        console.log(error)
    }
}