import { useContext, useEffect, useState } from "react";
import axiosClient from "./../../config/axiosClient";
import { ChildContext } from "../../layouts/ParentLayout";

const CheckupHistoryInfo = () => {
  const { selectedChild } = useContext(ChildContext);
  const [list, setList] = useState([]);

  useEffect(() => {
    const fethHistory = async () => {
      const res = await axiosClient.get(
        "student/" + selectedChild?.id + "/checkup-health-record"
      );
      console.log("Checkup history: ", res.data.data);
      setList(res.data.data);
    };
    fethHistory();
  }, []);

  return <div>Hello</div>;
};
export default CheckupHistoryInfo;
