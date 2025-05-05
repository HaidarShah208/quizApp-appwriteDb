'use client'
import React, { useState } from 'react';
import { databaseService } from '../appwrite/database.service';

export default function DatabaseTest() {
    const [connectionStatus, setConnectionStatus] = useState<string>('');
    const [testResult, setTestResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const testConnection = async () => {
        try {
            setConnectionStatus('Testing connection...');
            const result = await databaseService.testConnection();
            setConnectionStatus(result ? 'Connected successfully!' : 'Connection failed');
        } catch (err: any) {
            setConnectionStatus('Connection failed');
            setError(err.message);
        }
    };

    const testCreateAndFetch = async () => {
        try {
            setTestResult('Creating and fetching test quiz...');
            const result = await databaseService.testCreateAndFetch();
            setTestResult(result);
            setError('');
        } catch (err: any) {
            setTestResult(null);
            setError(err.message);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
            
            <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Test Connection</h2>
                    <button 
                        onClick={testConnection}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Test Connection
                    </button>
                    {connectionStatus && (
                        <p className={`mt-2 ${connectionStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                            {connectionStatus}
                        </p>
                    )}
                </div>

                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Test Create & Fetch Quiz</h2>
                    <button 
                        onClick={testCreateAndFetch}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Create Test Quiz
                    </button>
                    {testResult && typeof testResult === 'string' && (
                        <p className="mt-2 text-blue-600">{testResult}</p>
                    )}
                    {testResult && typeof testResult === 'object' && (
                        <div className="mt-4">
                            <h3 className="font-semibold">Test Results:</h3>
                            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                                {JSON.stringify(testResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                        <h3 className="text-red-600 font-semibold">Error:</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
} 