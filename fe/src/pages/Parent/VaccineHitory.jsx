import React, { useEffect, useState } from 'react'
import axiosClient from '../../config/axiosClient';

const VaccineHitory = () => {

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fecthHistory = async () => {
      const res = axiosClient.get("")
    }
  }, [])

  return (
    <div>
      
    </div>
  )
}

export default VaccineHitory
