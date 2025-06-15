import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axiosClient from '../../config/axiosClient';

const VaccineStudentList = () => {

    const mockPath = useLocation().pathname;
    const [id] = useState(mockPath.split('/')[3]);
    const [studentList, setStudentList] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            const res = await axiosClient.get('/vaccination-campaign/' + id + '/student-eligible')
            console.log("STUDENT LIST: ", res.data);
            setStudentList(res.data.data);
        }
        fetchStudents();
    }, [id])

  return (
    <div>
      this is list
    </div>
  )
}

export default VaccineStudentList
