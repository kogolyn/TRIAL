import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children, activeSection, onChangeSection }) {
    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar activeSection={activeSection} onChangeSection={onChangeSection} />
                <main className="flex-1 p-5 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
