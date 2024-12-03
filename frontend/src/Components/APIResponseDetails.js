// APIResponseDetails.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const APIResponseDetails = () => {
  const { userId } = useParams();
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const fetchAPIResponse = async () => {
      try {
        const response = await fetch("https://api.mindstudio.ai/developer/v1/apps/run", {
          method: 'POST',
          body: JSON.stringify({
            appId: "ec92e672-5fbc-425b-b5b6-19a11a0c373f",
            variables: { demoVariable: 'demoValue' },
            workflow: 'Main.flow'
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer sk52be3bd924f5fe4ab106892bfa849040e333f92e4d4911811f1c1b8aa39dad2a8994df146f5b936d7e5f1b5161a2c310c33dbfb9fc00e28bb8db18a183963465`,
          }
        });
        const data = await response.json();
        setApiResponse(data);
      } catch (error) {
        console.error('Error fetching API response:', error);
      }
    };

    fetchAPIResponse();
  }, []);

  if (!apiResponse) {
    return <p>Loading API response...</p>;
  }

  return (
    <div>
      <h2>API Response Details</h2>
      <p>Thread ID: {apiResponse.threadId}</p>
      <p>Thread: {apiResponse.thread}</p>
      {/* Display other details from apiResponse as needed */}
    </div>
  );
};

export default APIResponseDetails;
