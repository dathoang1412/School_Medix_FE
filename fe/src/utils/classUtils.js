import axiosClient from "../config/axiosClient";

export const fetchClass = async () => {
    try {
        const res = await axiosClient.get('/class');
        console.log("All Classes: ", res.data.data);
        return res.data.data
    } catch (error) {
        console.log("Error at fetchClass: ", error);
        return []   
    }
}