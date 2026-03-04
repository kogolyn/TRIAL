import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AmbulanceDashboard from '../pages/Ambulance/AmbulanceDashboard';
import FacilitiesMapPage from '../pages/Ambulance/FacilitiesMapPage';

function AmbulanceRoutes() {
  return (
    <Routes>
      <Route index element={<AmbulanceDashboard />} />
      <Route path='map' element={<AmbulanceDashboard />} />
      <Route path='facilities' element={<FacilitiesMapPage />} />
      <Route path='dispatch' element={<AmbulanceDashboard />} />
      <Route path='patient' element={<AmbulanceDashboard />} />
      <Route path='*' element={<Navigate to='/ambulance' replace />} />
    </Routes>
  );
}

export default AmbulanceRoutes;
