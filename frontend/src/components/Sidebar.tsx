import React, { useEffect, useState } from 'react';
import CreateUserModal from './CreateUserModal';
import { supabase } from '../utils/supabaseClient';

type SidebarProps = {
  role: string;
};

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [profile, setProfile] = useState<{ id: string; role: string; team: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  return (
    <aside style={{ width: 240, background: 'var(--color-subtle-background)', color: 'var(--color-text)', height: '100vh', padding: 24, borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <nav>
        <h2 style={{ color: 'var(--color-primary)', fontSize: '1.3rem', marginBottom: 32 }}>SGISI</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: 18 }}><a href="/Dashboard" style={{ color: 'var(--color-text)', textDecoration: 'none', fontWeight: 600 }}>Dashboard</a></li>
          {/* Otros links */}
          {role === 'Jefe de seguridad' && (
            <li style={{ marginBottom: 18 }}>
              <CreateUserModal />
            </li>
          )}
        </ul>
      </nav>
      <div style={{ marginTop: 32, fontSize: '0.95rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: 18 }}>
        {profile ? (
          <>
            <div><strong>ID:</strong> {profile.id}</div>
            <div><strong>Rol:</strong> {profile.role}</div>
            <div><strong>Equipo:</strong> {profile.team}</div>
          </>
        ) : (
          <div>Cargando perfil...</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
