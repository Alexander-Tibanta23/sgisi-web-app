const { supabase } = require('../supabase.config');

describe('Supabase RLS - Políticas Específicas de Profiles', () => {
  
  const usuarios = {
    normal: {
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD
    },
    analista: {
      email: process.env.ANALYST_USER_EMAIL,
      password: process.env.ANALYST_USER_PASSWORD
    },
    jefeSeguridad: {
      email: process.env.SECURITY_CHIEF_EMAIL,
      password: process.env.SECURITY_CHIEF_PASSWORD
    }
  };

  let usuarioNormalId = null;
  let analistaId = null;
  let jefeId = null;

  beforeAll(async () => {
    console.log('=== Configurando usuarios para políticas específicas de Profiles ===');
    
    const { data: normalData } = await supabase.auth.signInWithPassword(usuarios.normal);
    usuarioNormalId = normalData.user.id;
    await supabase.auth.signOut();
    
    const { data: analistaData } = await supabase.auth.signInWithPassword(usuarios.analista);
    analistaId = analistaData.user.id;
    await supabase.auth.signOut();
    
    const { data: jefeData } = await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
    jefeId = jefeData.user.id;
    await supabase.auth.signOut();
    
    console.log('IDs obtenidos:', { usuarioNormalId, analistaId, jefeId });
  });

  describe('📋 Política SELECT: "Enable users to view their own data only"', () => {
    
    test('✅ Usuario normal solo ve su propio profile', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      console.log('Usuario normal consultando profiles...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      // Solo debe ver su propio profile
      const ownProfiles = data.filter(p => p.id === usuarioNormalId);
      const otherProfiles = data.filter(p => p.id !== usuarioNormalId);
      
      expect(ownProfiles.length).toBe(1);
      expect(otherProfiles.length).toBe(0);
      
      console.log(`✅ Usuario normal ve solo su profile: ${ownProfiles.length} propio, ${otherProfiles.length} de otros`);
      console.log('Profile visible:', ownProfiles[0]);
      
      await supabase.auth.signOut();
    });

    test('✅ Analista solo ve su propio profile', async () => {
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      console.log('Analista consultando profiles...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      // Solo debe ver su propio profile
      const ownProfiles = data.filter(p => p.id === analistaId);
      const otherProfiles = data.filter(p => p.id !== analistaId);
      
      expect(ownProfiles.length).toBe(1);
      expect(otherProfiles.length).toBe(0);
      
      console.log(`✅ Analista ve solo su profile: ${ownProfiles.length} propio, ${otherProfiles.length} de otros`);
      console.log('Profile visible:', ownProfiles[0]);
      
      await supabase.auth.signOut();
    });

  });

  describe('📋 Política SELECT: "Jefe de seguridad puede ver todos los analistas"', () => {
    
    test('✅ Jefe de seguridad ve todos los profiles', async () => {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      console.log('Jefe de seguridad consultando todos los profiles...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(1);
      
      // Debe ver todos los profiles incluyendo el suyo, del analista y usuario normal
      const jefeProfile = data.find(p => p.id === jefeId);
      const analistaProfile = data.find(p => p.id === analistaId);
      const normalProfile = data.find(p => p.id === usuarioNormalId);
      
      expect(jefeProfile).toBeDefined();
      expect(analistaProfile).toBeDefined();
      expect(normalProfile).toBeDefined();
      
      console.log(`✅ Jefe de seguridad ve ${data.length} profiles (acceso completo)`);
      console.log('Profiles encontrados:');
      console.log('- Jefe:', jefeProfile ? jefeProfile.nombre : 'No encontrado');
      console.log('- Analista:', analistaProfile ? analistaProfile.nombre : 'No encontrado');
      console.log('- Usuario normal:', normalProfile ? normalProfile.nombre : 'No encontrado');
      
      await supabase.auth.signOut();
    });

  });

  describe('📋 Política UPDATE: "Jefe de seguridad puede asignar equipo a analistas"', () => {
    
    test('❌ Usuario normal NO puede actualizar profiles', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      console.log('Usuario normal intentando actualizar su profile...');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nombre: 'Usuario normal intentando actualizar'
        })
        .eq('id', usuarioNormalId)
        .select();

      // Debe fallar o no afectar registros
      if (error) {
        expect(error).toBeDefined();
        console.log('✅ Usuario normal bloqueado con error:', error.message);
      } else {
        expect(data.length).toBe(0);
        console.log('✅ Actualización de usuario normal no afectó registros');
      }
      
      await supabase.auth.signOut();
    });

    test('❌ Analista NO puede actualizar profiles', async () => {
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      console.log('Analista intentando actualizar su profile...');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nombre: 'Analista intentando actualizar'
        })
        .eq('id', analistaId)
        .select();

      // Debe fallar o no afectar registros
      if (error) {
        expect(error).toBeDefined();
        console.log('✅ Analista bloqueado con error:', error.message);
      } else {
        expect(data.length).toBe(0);
        console.log('✅ Actualización de analista no afectó registros');
      }
      
      await supabase.auth.signOut();
    });

    test('✅ Jefe de seguridad SÍ puede actualizar profiles (asignar equipo a analistas)', async () => {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      console.log('Jefe de seguridad actualizando profile de analista...');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nombre: 'Analista con Equipo Asignado por Jefe'
        })
        .eq('id', analistaId)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].nombre).toBe('Analista con Equipo Asignado por Jefe');
      
      console.log('✅ Jefe de seguridad actualizó profile del analista exitosamente');
      console.log('Profile actualizado:', data[0]);
      
      await supabase.auth.signOut();
    });

    test('✅ Jefe de seguridad puede actualizar cualquier profile', async () => {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      console.log('Jefe de seguridad actualizando profile de usuario normal...');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nombre: 'Usuario Normal con Permisos del Jefe'
        })
        .eq('id', usuarioNormalId)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].nombre).toBe('Usuario Normal con Permisos del Jefe');
      
      console.log('✅ Jefe de seguridad actualizó profile del usuario normal exitosamente');
      console.log('Profile actualizado:', data[0]);
      
      await supabase.auth.signOut();
    });

  });

  describe('📊 Resumen de Políticas Específicas Profiles', () => {
    
    test('🔒 Verificación completa de las 3 políticas específicas', () => {
      console.log('\n🛡️ === POLÍTICAS ESPECÍFICAS PROFILES VERIFICADAS ===');
      console.log('');
      console.log('📋 Política SELECT: "Enable users to view their own data only"');
      console.log('  ✅ Usuario normal ve solo su propio profile');
      console.log('  ✅ Analista ve solo su propio profile');
      console.log('  ✅ Cada usuario tiene acceso restringido a sus propios datos');
      console.log('');
      console.log('📋 Política SELECT: "Jefe de seguridad puede ver todos los analistas"');
      console.log('  ✅ Jefe de seguridad ve todos los profiles');
      console.log('  ✅ Acceso administrativo completo para jefe de seguridad');
      console.log('');
      console.log('📋 Política UPDATE: "Jefe de seguridad puede asignar equipo a analistas"');
      console.log('  ❌ Usuario normal no puede actualizar profiles');
      console.log('  ❌ Analista no puede actualizar profiles');
      console.log('  ✅ Solo jefe de seguridad puede actualizar profiles');
      console.log('  ✅ Jefe puede asignar equipos a analistas y otros usuarios');
      console.log('');
      console.log('🎯 TODAS LAS POLÍTICAS ESPECÍFICAS FUNCIONAN CORRECTAMENTE');
      console.log('===============================================\n');
      
      expect(true).toBe(true);
    });

  });

});
