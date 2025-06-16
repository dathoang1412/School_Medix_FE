import React, { useEffect, useState } from 'react'
import axiosClient from '../../config/axiosClient';

const RegularCheckup = () => {

    const [campaignList, setCampaignList] = useState([]);

    useEffect(() => {
        const fetchCampaign = async () => {
            const res = await axiosClient.get('/checkup-campaign/get-all')
            console.log("CHECKUP CAMPAIGN LIST: ", res.data);
            setCampaignList(res.data)
        }
        fetchCampaign();
    }, [])

  return (
    <div>
      regular checkup   
    </div>
  )
}

export default RegularCheckup
