import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

interface UserContextType {
  userId: string;
  userEmail: string;
  userRole: string;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setManualRole: (role: string) => void; // Temporary for testing
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  // Temporary function to manually set role for testing
  const setManualRole = (role: string) => {
    console.log('Manually setting role to:', role);
    setUserRole(role);
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      console.log('UserContext: Starting fetchUser...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('UserContext: Error getting user:', userError);
        setLoading(false);
        return;
      }
      
      if (user) {
        console.log('UserContext: User found:', user.id, user.email);
        setUserId(user.id);
        setUserEmail(user.email || '');
        
        console.log('UserContext: Fetching profile data...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('UserContext: Profile query result:', { profileData, profileError });
        
        if (profileError) {
          console.error("UserContext: Error fetching profile:", profileError);
          console.error("UserContext: Error details:", {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          });
          
          // Try to get table structure to debug
          console.log('UserContext: Attempting to check profiles table structure...');
          const { data: tableInfo, error: tableError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
          
          if (tableInfo && tableInfo.length > 0) {
            console.log('UserContext: Sample profile structure:', Object.keys(tableInfo[0]));
          }
          
          // Try to create profile if it doesn't exist
          console.log('UserContext: Attempting to create profile...');
          const { data: createData, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              nombre: user.email?.split('@')[0] || 'Usuario',
              role: 'Jefe de seguridad' // Default role for testing
            }])
            .select();
          
          if (createError) {
            console.error('UserContext: Error creating profile:', createError);
            setUserRole('Usuario normal');
          } else {
            console.log('UserContext: Profile created successfully:', createData);
            setUserRole('Jefe de seguridad');
          }
        } else {
          console.log('UserContext: Profile data found:', profileData);
          
          // Check different possible column names for role
          const role = profileData?.role || 'Usuario normal';
          console.log('UserContext: Setting user role to:', role);
          console.log('UserContext: Available columns in profile:', profileData ? Object.keys(profileData) : 'none');
          setUserRole(role);
        }
      } else {
        console.log('UserContext: No user found');
        setUserId('');
        setUserEmail('');
        setUserRole('');
      }
    } catch (error) {
      console.error('UserContext: Error in fetchUser:', error);
      setUserRole('Usuario normal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <UserContext.Provider value={{ userId, userEmail, userRole, loading, refreshUser, setManualRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
