import React, { useEffect, useState } from 'react';
import axiosClient from '../../config/axiosClient';
import { useParams, useNavigate } from 'react-router-dom';

const Survey = () => {
  const { student_id, campaign_id } = useParams();
  const navigate = useNavigate();
  
  const [register, setRegister] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchRegister = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(
          `/student/${student_id}/vaccination-campaign/${campaign_id}/register`
        );
        console.log("REGISTER DETAILS: ", res.data.data);
        setRegister(res.data.data[0]);
      } catch (err) {
        setError('Failed to fetch registration details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegister();
  }, [student_id, campaign_id]);

  const handleAccept = async () => {
    if (!register?.id) return;
    try {
      setProcessing(true);
      await axiosClient.patch(`/vaccination-register/${register.id}/accept`);
      alert('Registration accepted successfully');
      navigate(-1); // Go back to previous page
    } catch (err) {
      setError('Failed to accept registration');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRefuse = async () => {
    if (!register?.id) return;
    try {
      setProcessing(true);
      await axiosClient.patch(`/vaccination-register/${register.id}/refuse`);
      alert('Registration refused successfully');
      navigate(-1); // Go back to previous page
    } catch (err) {
      setError('Failed to refuse registration');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!register) return <div>No registration found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Vaccination Registration Survey</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Registration Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Student ID:</p>
            <p>{register.student_id}</p>
          </div>
          <div>
            <p className="font-medium">Campaign ID:</p>
            <p>{register.campaign_id}</p>
          </div>
          <div>
            <p className="font-medium">Registration Status:</p>
            <p>{register.is_registered ? 'Registered' : 'Not Registered'}</p>
          </div>
          <div>
            <p className="font-medium">Reason:</p>
            <p>{register.reason || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Submitted By:</p>
            <p>{register.submit_by || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Submit Time:</p>
            <p>{register.submit_time || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleRefuse}
          disabled={processing}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
        >
          {processing ? 'Processing...' : 'Refuse'}
        </button>
        <button
          onClick={handleAccept}
          disabled={processing}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {processing ? 'Processing...' : 'Accept'}
        </button>
      </div>
    </div>
  );
};

export default Survey;