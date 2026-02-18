import React, { useState } from 'react';
import Layout from '../../components/dispatcher/Layout';
import ActiveIncidents from '../../pages/dispatcher/ActiveIncidents';
import IncidentMap from '../../components/dispatcher/IncidentMap';
import CoordinationActions from '../../pages/dispatcher/CoordinationActions';
import StatusCards from '../../pages/dispatcher/StatusCards';

export default function Dispatcher() {
    return (
        <Layout>
            <div className="flex flex-col gap-5">
                <div className="flex gap-5 h-[350px]">
                    <ActiveIncidents />
                    <IncidentMap />
                </div>
                <CoordinationActions />
                <StatusCards />
            </div>
        </Layout>
    );
}
