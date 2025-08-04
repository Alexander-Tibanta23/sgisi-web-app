import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const DatabaseTester: React.FC = () => {
  const [testResults, setTestResults] = useState<string>('');

  const runTests = async () => {
    let results = '=== TESTING DATABASE ACCESS ===\n\n';
    
    try {
      // Test 1: Get current user
      results += '1. Testing auth.getUser():\n';
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      results += `User: ${user ? user.id : 'null'}\n`;
      results += `Error: ${userError ? userError.message : 'none'}\n\n`;
      
      if (user) {
        // Test 2: Get user profile
        results += '2. Testing profiles table access:\n';
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        results += `Profile data: ${profileData ? JSON.stringify(profileData, null, 2) : 'null'}\n`;
        results += `Profile error: ${profileError ? JSON.stringify(profileError, null, 2) : 'none'}\n\n`;
        
        // Test 3: Get all profiles
        results += '3. Testing all profiles access:\n';
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);
        
        results += `All profiles count: ${allProfiles ? allProfiles.length : 0}\n`;
        results += `All profiles error: ${allProfilesError ? JSON.stringify(allProfilesError, null, 2) : 'none'}\n\n`;
        
        // Test 4: Get teams
        results += '4. Testing teams table access:\n';
        const { data: teamsData, error: teamsError } = await supabase
          .from('team')
          .select('*');
        
        results += `Teams count: ${teamsData ? teamsData.length : 0}\n`;
        results += `Teams error: ${teamsError ? JSON.stringify(teamsError, null, 2) : 'none'}\n\n`;
        
        // Test 5: Get incidents
        results += '5. Testing incidents table access:\n';
        const { data: incidentsData, error: incidentsError } = await supabase
          .from('incidentes')
          .select('*')
          .limit(5);
        
        results += `Incidents count: ${incidentsData ? incidentsData.length : 0}\n`;
        results += `Incidents error: ${incidentsError ? JSON.stringify(incidentsError, null, 2) : 'none'}\n\n`;
      }
      
    } catch (error) {
      results += `Unexpected error: ${error}\n`;
    }
    
    setTestResults(results);
    console.log(results);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Database Access Tester</h3>
      <button
        onClick={runTests}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Run Database Tests
      </button>
      {testResults && (
        <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
          {testResults}
        </pre>
      )}
    </div>
  );
};

export default DatabaseTester;
