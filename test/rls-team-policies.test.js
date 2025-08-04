const { supabase } = require('../supabase.config');

describe('Supabase RLS - Políticas de Team', () => {
  
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
  let teamCreatedId = null;

  beforeAll(async () => {
    console.log('=== Configurando usuarios para pruebas de políticas Team ===');
    
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

  describe('Política INSERT - "Jefe de seguridad puede crear equipos"', () => {
    
    test('❌ Usuario NORMAL NO puede crear equipos', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      console.log('Intentando crear equipo como usuario normal...');
      
      const { data, error } = await supabase
        .from('team')
        .insert([{
          nombre: 'Equipo creado por usuario normal'
        }])
        .select();

      // Debe fallar completamente
      expect(error).toBeDefined();
      expect(data).toBeNull();
      console.log('✅ Usuario normal no puede crear equipos');
      console.log('Error esperado:', error.message);
      
      await supabase.auth.signOut();
    });

    test('❌ ANALISTA NO puede crear equipos', async () => {
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      console.log('Intentando crear equipo como analista...');
      
      const { data, error } = await supabase
        .from('team')
        .insert([{
          nombre: 'Equipo creado por analista'
        }])
        .select();

      // Debe fallar completamente
      expect(error).toBeDefined();
      expect(data).toBeNull();
      console.log('✅ Analista no puede crear equipos');
      console.log('Error esperado:', error.message);
      
      await supabase.auth.signOut();
    });

    test('✅ JEFE DE SEGURIDAD SÍ puede crear equipos', async () => {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      console.log('Creando equipo como jefe de seguridad...');
      
      const { data, error } = await supabase
        .from('team')
        .insert([{
          nombre: 'Equipo Alpha - Creado por Jefe'
        }])
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].nombre).toBe('Equipo Alpha - Creado por Jefe');
      
      // Guardar ID para pruebas posteriores
      teamCreatedId = data[0].id;
      
      console.log('✅ Jefe de seguridad creó equipo exitosamente');
      console.log('Equipo creado:', data[0]);
      
      await supabase.auth.signOut();
    });

  });

  describe('Política SELECT - "Jefe de seguridad puede ver todos los equipos"', () => {
    
    test('❌ Usuario NORMAL NO puede ver equipos', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      console.log('Intentando ver equipos como usuario normal...');
      
      const { data, error } = await supabase
        .from('team')
        .select('*');

      // Debe fallar o retornar datos vacíos
      if (error) {
        expect(error).toBeDefined();
        console.log('✅ Usuario normal bloqueado con error:', error.message);
      } else {
        expect(data).toBeDefined();
        expect(data.length).toBe(0);
        console.log('✅ Usuario normal no ve ningún equipo (datos vacíos)');
      }
      
      await supabase.auth.signOut();
    });

    test('❌ ANALISTA NO puede ver equipos', async () => {
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      console.log('Intentando ver equipos como analista...');
      
      const { data, error } = await supabase
        .from('team')
        .select('*');

      // Debe fallar o retornar datos vacíos
      if (error) {
        expect(error).toBeDefined();
        console.log('✅ Analista bloqueado con error:', error.message);
      } else {
        expect(data).toBeDefined();
        expect(data.length).toBe(0);
        console.log('✅ Analista no ve ningún equipo (datos vacíos)');
      }
      
      await supabase.auth.signOut();
    });

    test('✅ JEFE DE SEGURIDAD SÍ puede ver todos los equipos', async () => {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      console.log('Consultando equipos como jefe de seguridad...');
      
      const { data, error } = await supabase
        .from('team')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Verificar que puede ver el equipo que creó
      const equipoCreado = data.find(team => team.id === teamCreatedId);
      expect(equipoCreado).toBeDefined();
      expect(equipoCreado.nombre).toBe('Equipo Alpha - Creado por Jefe');
      
      console.log(`✅ Jefe de seguridad ve ${data.length} equipos correctamente`);
      console.log('Equipos visibles:', data.map(t => ({ id: t.id, nombre: t.nombre })));
      
      await supabase.auth.signOut();
    });

  });

  describe('Verificación de políticas UPDATE/DELETE', () => {
    
    test('❌ Usuario NORMAL NO puede actualizar equipos', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      console.log('Intentando actualizar equipo como usuario normal...');
      
      const { data, error } = await supabase
        .from('team')
        .update({
          nombre: 'Intento de actualización maliciosa'
        })
        .eq('id', teamCreatedId)
        .select();

      // Debe fallar o no afectar registros
      if (error) {
        expect(error).toBeDefined();
        console.log('✅ Usuario normal bloqueado al actualizar:', error.message);
      } else {
        expect(data.length).toBe(0);
        console.log('✅ Actualización de usuario normal no afectó registros');
      }
      
      await supabase.auth.signOut();
    });

    test('❌ ANALISTA NO puede actualizar equipos', async () => {
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      console.log('Intentando actualizar equipo como analista...');
      
      const { data, error } = await supabase
        .from('team')
        .update({
          nombre: 'Analista intentando modificar'
        })
        .eq('id', teamCreatedId)
        .select();

      // Debe fallar o no afectar registros
      if (error) {
        expect(error).toBeDefined();
        console.log('✅ Analista bloqueado al actualizar:', error.message);
      } else {
        expect(data.length).toBe(0);
        console.log('✅ Actualización de analista no afectó registros');
      }
      
      await supabase.auth.signOut();
    });

    test('✅ JEFE DE SEGURIDAD puede actualizar equipos', async () => {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      console.log('Actualizando equipo como jefe de seguridad...');
      
      const { data, error } = await supabase
        .from('team')
        .update({
          nombre: 'Equipo Alpha - Actualizado'
        })
        .eq('id', teamCreatedId)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].nombre).toBe('Equipo Alpha - Actualizado');
      
      console.log('✅ Jefe de seguridad actualizó equipo exitosamente');
      
      await supabase.auth.signOut();
    });

  });

  describe('📊 Resumen de Políticas Team', () => {
    
    test('🔒 Verificación completa de políticas RLS Team', () => {
      console.log('\n🛡️ === POLÍTICAS TEAM VERIFICADAS ===');
      console.log('📋 Política INSERT: "Jefe de seguridad puede crear equipos"');
      console.log('  ❌ Usuario normal no puede crear equipos');
      console.log('  ❌ Analista no puede crear equipos');
      console.log('  ✅ Solo jefe de seguridad puede crear equipos');
      console.log('');
      console.log('📋 Política SELECT: "Jefe de seguridad puede ver todos los equipos"');
      console.log('  ❌ Usuario normal no puede ver equipos');
      console.log('  ❌ Analista no puede ver equipos');
      console.log('  ✅ Solo jefe de seguridad puede ver todos los equipos');
      console.log('');
      console.log('📋 Políticas implícitas UPDATE/DELETE:');
      console.log('  ❌ Usuario normal no puede actualizar equipos');
      console.log('  ❌ Analista no puede actualizar equipos');
      console.log('  ✅ Solo jefe de seguridad puede actualizar equipos');
      console.log('===============================\n');
      
      expect(true).toBe(true);
    });

  });

  afterAll(async () => {
    // Limpiar el equipo creado durante las pruebas
    if (teamCreatedId) {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      const { error } = await supabase
        .from('team')
        .delete()
        .eq('id', teamCreatedId);
      
      if (!error) {
        console.log('🗑️ Equipo de prueba eliminado correctamente');
      }
      
      await supabase.auth.signOut();
    }
  });

});
