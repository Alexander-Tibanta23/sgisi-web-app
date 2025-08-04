import { supabase } from '../utils/supabaseClient';

export const debugDatabase = async () => {
  console.log('=== DATABASE STRUCTURE DEBUG ===');
  
  try {
    // Test 1: Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('1. User authentication:', { user: user?.id, error: userError?.message });
    
    if (!user) {
      console.log('❌ No authenticated user found');
      return;
    }
    
    // Test 2: Try to access profiles table with minimal query
    console.log('2. Testing profiles table access...');
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('Profiles table test:', { 
      success: !profilesError, 
      error: profilesError?.message,
      errorCode: profilesError?.code,
      dataCount: profilesTest?.length 
    });
    
    if (profilesTest && profilesTest.length > 0) {
      console.log('Available columns in profiles:', Object.keys(profilesTest[0]));
    }
    
    // Test 3: Try to access teams table
    console.log('3. Testing teams table access...');
    const { data: teamsTest, error: teamsError } = await supabase
      .from('team')
      .select('*')
      .limit(1);
    
    console.log('Teams table test:', { 
      success: !teamsError, 
      error: teamsError?.message,
      errorCode: teamsError?.code,
      dataCount: teamsTest?.length 
    });
    
    if (teamsTest && teamsTest.length > 0) {
      console.log('Available columns in team:', Object.keys(teamsTest[0]));
    }
    
    // Test 4: Try to access incidents table
    console.log('4. Testing incidents table access...');
    const { data: incidentsTest, error: incidentsError } = await supabase
      .from('incidentes')
      .select('*')
      .limit(1);
    
    console.log('Incidents table test:', { 
      success: !incidentsError, 
      error: incidentsError?.message,
      errorCode: incidentsError?.code,
      dataCount: incidentsTest?.length 
    });
    
    // Test 5: Check current user's profile specifically
    console.log('5. Testing current user profile...');
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log('User profile test:', { 
      success: !userProfileError, 
      error: userProfileError?.message,
      errorCode: userProfileError?.code,
      profile: userProfile 
    });
    
    // Summary
    console.log('=== SUMMARY ===');
    console.log('✅ User authenticated:', !!user);
    console.log('✅ Profiles table accessible:', !profilesError);
    console.log('✅ Teams table accessible:', !teamsError);
    console.log('✅ Incidents table accessible:', !incidentsError);
    console.log('✅ User profile exists:', !userProfileError);
    
    return {
      userAuthenticated: !!user,
      profilesAccessible: !profilesError,
      teamsAccessible: !teamsError,
      incidentsAccessible: !incidentsError,
      userProfileExists: !userProfileError,
      profilesColumns: profilesTest && profilesTest.length > 0 ? Object.keys(profilesTest[0]) : [],
      teamsColumns: teamsTest && teamsTest.length > 0 ? Object.keys(teamsTest[0]) : [],
      userProfile: userProfile
    };
    
  } catch (err) {
    console.error('❌ Unexpected error in database debug:', err);
    return null;
  }
};

export default debugDatabase;
