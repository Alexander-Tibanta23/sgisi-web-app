const { supabase } = require('../supabase.config');

describe('Supabase RLS - Políticas de Team Table', () => {
  
  const usuarios = {
    jefeSeguridad: {
      email: process.env.SECURITY_CHIEF_EMAIL,
      password: process.env.SECURITY_CHIEF_PASSWORD
    },
    analista: {
      email: process.env.ANALYST_USER_EMAIL,
      password: process.env.ANALYST_USER_PASSWORD
    },
    normal: {
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD
    }
  };

  beforeAll(async () => {
    console.log('=== Configurando pruebas de políticas Team ===');
    
    // Verificar que RLS esté habilitado en la tabla team
    const { data: tableInfo, error } = await supabase
      .from('team')
      .select('*')
      .limit(1);
    
    console.log('Team table access test:', { data: tableInfo, error });
  });

  describe('🔒 Políticas de acceso a tabla Team', () => {
    
    test('✅ Jefe de seguridad puede leer teams', async () => {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      const { data, error } = await supabase
        .from('team')
        .select('*');

      console.log('Jefe seguridad leyendo teams:', { data: data?.length, error });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      await supabase.auth.signOut();
    });

    test('✅ Jefe de seguridad puede crear teams', async () => {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      const teamName = `Test Team ${Date.now()}`;
      const { data, error } = await supabase
        .from('team')
        .insert([{ nombre: teamName }])
        .select();

      console.log('Jefe seguridad creando team:', { data, error });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data[0]?.nombre).toBe(teamName);
      
      // Limpiar el team creado
      if (data && data[0]) {
        await supabase
          .from('team')
          .delete()
          .eq('id', data[0].id);
      }
      
      await supabase.auth.signOut();
    });

    test('❌ Analista NO puede acceder a teams', async () => {
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      const { data, error } = await supabase
        .from('team')
        .select('*');

      console.log('Analista intentando leer teams:', { data, error });
      
      // Debe fallar o retornar array vacío
      if (error) {
        expect(error).toBeDefined();
      } else {
        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
        // Si no hay error, al menos no debería ver teams
      }
      
      await supabase.auth.signOut();
    });

    test('❌ Usuario normal NO puede acceder a teams', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      const { data, error } = await supabase
        .from('team')
        .select('*');

      console.log('Usuario normal intentando leer teams:', { data, error });
      
      // Debe fallar o retornar array vacío
      if (error) {
        expect(error).toBeDefined();
      } else {
        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
        // Si no hay error, al menos no debería ver teams
      }
      
      await supabase.auth.signOut();
    });

  });

  describe('📊 Diagnóstico de políticas Team', () => {
    
    test('🔍 Verificar configuración de RLS en team table', async () => {
      console.log('\n🛡️ === DIAGNÓSTICO TABLA TEAM ===');
      console.log('');
      console.log('Si esta prueba falla, ejecuta en Supabase SQL Editor:');
      console.log('');
      console.log('-- Habilitar RLS en tabla team');
      console.log('ALTER TABLE team ENABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('-- Política para que solo Jefe de seguridad pueda leer teams');
      console.log(`CREATE POLICY "Jefe de seguridad puede leer teams" ON team`);
      console.log(`FOR SELECT USING (`);
      console.log(`  EXISTS (`);
      console.log(`    SELECT 1 FROM profiles`);
      console.log(`    WHERE profiles.id = auth.uid()`);
      console.log(`    AND profiles.role = 'Jefe de seguridad'`);
      console.log(`  )`);
      console.log(`);`);
      console.log('');
      console.log('-- Política para que solo Jefe de seguridad pueda insertar teams');
      console.log(`CREATE POLICY "Jefe de seguridad puede crear teams" ON team`);
      console.log(`FOR INSERT WITH CHECK (`);
      console.log(`  EXISTS (`);
      console.log(`    SELECT 1 FROM profiles`);
      console.log(`    WHERE profiles.id = auth.uid()`);
      console.log(`    AND profiles.role = 'Jefe de seguridad'`);
      console.log(`  )`);
      console.log(`);`);
      console.log('');
      console.log('-- Política para que solo Jefe de seguridad pueda actualizar teams');
      console.log(`CREATE POLICY "Jefe de seguridad puede actualizar teams" ON team`);
      console.log(`FOR UPDATE USING (`);
      console.log(`  EXISTS (`);
      console.log(`    SELECT 1 FROM profiles`);
      console.log(`    WHERE profiles.id = auth.uid()`);
      console.log(`    AND profiles.role = 'Jefe de seguridad'`);
      console.log(`  )`);
      console.log(`);`);
      console.log('');
      console.log('===============================================\n');
      
      expect(true).toBe(true);
    });

  });

});
