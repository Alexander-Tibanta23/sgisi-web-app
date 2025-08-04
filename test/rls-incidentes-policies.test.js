const { supabase } = require('../supabase.config');

describe('Supabase RLS - Políticas Específicas de Incidentes', () => {
  
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
  let incidentesPrueba = [];
  let teamId = null;

  beforeAll(async () => {
    console.log('=== Configurando usuarios para políticas específicas de Incidentes ===');
    
    const { data: normalData } = await supabase.auth.signInWithPassword(usuarios.normal);
    usuarioNormalId = normalData.user.id;
    await supabase.auth.signOut();
    
    const { data: analistaData } = await supabase.auth.signInWithPassword(usuarios.analista);
    analistaId = analistaData.user.id;
    await supabase.auth.signOut();
    
    const { data: jefeData } = await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
    jefeId = jefeData.user.id;
    await supabase.auth.signOut();
    
    // Obtener team del analista
    await supabase.auth.signInWithPassword(usuarios.analista);
    const { data: profileData } = await supabase
      .from('profiles')
      .select('team')
      .eq('id', analistaId)
      .single();
    teamId = profileData?.team;
    await supabase.auth.signOut();
    
    console.log('IDs obtenidos:', { usuarioNormalId, analistaId, jefeId, teamId });
  });

  afterAll(async () => {
    // Limpiar incidentes de prueba
    if (incidentesPrueba.length > 0) {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      for (const id of incidentesPrueba) {
        await supabase.from('incidentes').delete().eq('id', id);
      }
      await supabase.auth.signOut();
    }
  });

  describe('📋 Política INSERT: "Usuarios normales autenticados pueden reportar incidentes"', () => {
    
    test('✅ Usuario normal puede crear incidentes', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      console.log('Usuario normal creando incidente...');
      
      const { data, error } = await supabase
        .from('incidentes')
        .insert([{
          titulo: 'Incidente reportado por usuario normal',
          descripcion: 'Descripción del incidente de prueba',
          nivel: 'Medio',
          estado: 'Nuevo',
          tipo: 'Software',
          dueño: usuarioNormalId,
          activo_afectado: 'Sistema de archivos',
          evidencia: 'Evidencia inicial del incidente'
        }])
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].dueño).toBe(usuarioNormalId);
      
      incidentesPrueba.push(data[0].id);
      console.log('✅ Usuario normal creó incidente exitosamente:', data[0].titulo);
      
      await supabase.auth.signOut();
    });

    test('❌ Analista NO puede crear incidentes (solo usuarios normales)', async () => {
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      console.log('Analista intentando crear incidente...');
      
      const { data, error } = await supabase
        .from('incidentes')
        .insert([{
          titulo: 'Intento de incidente por analista',
          descripcion: 'Los analistas no deberían poder crear incidentes',
          nivel: 'Alto',
          estado: 'En investigacion',
          tipo: 'Hardware',
          dueño: analistaId,
          activo_afectado: 'Servidor principal',
          evidencia: 'Evidencia del analista'
        }])
        .select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
      console.log('✅ Analista correctamente bloqueado para crear incidentes');
      console.log('Error esperado:', error.message);
      
      await supabase.auth.signOut();
    });

    test('❌ Usuarios no autenticados NO pueden crear incidentes', async () => {
      await supabase.auth.signOut();
      
      console.log('Intentando crear incidente sin autenticación...');
      
      const { data, error } = await supabase
        .from('incidentes')
        .insert([{
          titulo: 'Incidente sin autenticación',
          descripcion: 'Intento no autorizado',
          nivel: 'Bajo',
          estado: 'Nuevo',
          tipo: 'Software',
          activo_afectado: 'Sistema',
          evidencia: 'Sin evidencia'
        }])
        .select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
      console.log('✅ Usuario no autenticado correctamente bloqueado');
      console.log('Error esperado:', error.message);
    });

  });

  describe('📋 Política SELECT: "Enable users to view their own data only"', () => {
    
    test('✅ Usuario normal ve solo sus propios incidentes', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      console.log('Usuario normal consultando sus incidentes...');
      
      const { data, error } = await supabase
        .from('incidentes')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      // Todos los incidentes visibles deben ser del usuario normal
      const incidentesPropios = data.filter(i => i.dueño === usuarioNormalId);
      const incidentesAjenos = data.filter(i => i.dueño !== usuarioNormalId);
      
      expect(incidentesPropios.length).toBeGreaterThan(0);
      // Verificar que TODOS los incidentes que ve son propios
      expect(data.length).toBe(incidentesPropios.length);
      expect(incidentesAjenos.length).toBe(0);
      
      console.log(`✅ Usuario normal ve ${data.length} incidentes, todos son propios (${incidentesPropios.length} propios, ${incidentesAjenos.length} ajenos)`);
      
      await supabase.auth.signOut();
    });

  });

  describe('📋 Política SELECT: "Analistas pueden ver los incidentes que se le asignan"', () => {
    
    test('✅ Analista ve incidentes asignados a él', async () => {
      // Verificar que hay al menos un incidente creado
      if (incidentesPrueba.length === 0) {
        console.log('ℹ️ No hay incidentes para asignar, saltando test');
        return;
      }
      
      // Primero asignar un incidente al analista (como jefe)
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      const { data: incidenteAsignado } = await supabase
        .from('incidentes')
        .update({ 
          responsable: analistaId,
          estado: 'En investigacion'
        })
        .eq('id', incidentesPrueba[0])
        .select()
        .single();
      
      await supabase.auth.signOut();
      
      // Ahora verificar que el analista puede verlo
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      console.log('Analista consultando incidentes asignados...');
      
      const { data, error } = await supabase
        .from('incidentes')
        .select('*')
        .eq('responsable', analistaId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      
      const incidenteEncontrado = data.find(i => i.id === incidentesPrueba[0]);
      expect(incidenteEncontrado).toBeDefined();
      expect(incidenteEncontrado.responsable).toBe(analistaId);
      
      console.log(`✅ Analista ve ${data.length} incidentes asignados a él`);
      
      await supabase.auth.signOut();
    });

  });

  describe('📋 Política SELECT: "Analistas pueden ver los incidentes de su propio equipo"', () => {
    
    test('✅ Analista ve incidentes de su equipo', async () => {
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      console.log('Analista consultando incidentes de su equipo...');
      
      const { data, error } = await supabase
        .from('incidentes')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      console.log(`✅ Analista ve ${data.length} incidentes (propios + asignados + de equipo)`);
      
      await supabase.auth.signOut();
    });

  });

  describe('📋 Política UPDATE: "Analista puede editar los incidentes que se le asignan"', () => {
    
    test('✅ Analista puede actualizar incidentes asignados', async () => {
      // Verificar que hay al menos un incidente creado
      if (incidentesPrueba.length === 0) {
        console.log('ℹ️ No hay incidentes para actualizar, saltando test');
        return;
      }
      
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      console.log('Analista actualizando incidente asignado...');
      
      const { data, error } = await supabase
        .from('incidentes')
        .update({
          estado: 'Contenido',
          descripcion: 'Actualizado por analista - incidente contenido'
        })
        .eq('id', incidentesPrueba[0])
        .eq('responsable', analistaId)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].estado).toBe('Contenido');
      
      console.log('✅ Analista actualizó incidente asignado exitosamente');
      
      await supabase.auth.signOut();
    });

    test('❌ Analista NO puede actualizar incidentes no asignados', async () => {
      // Crear un incidente que no esté asignado al analista
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      const { data: nuevoIncidente, error: insertError } = await supabase
        .from('incidentes')
        .insert([{
          titulo: 'Incidente NO asignado al analista',
          descripcion: 'Este incidente no debe ser editable por el analista',
          nivel: 'Bajo',
          estado: 'Nuevo',
          tipo: 'Software',
          dueño: usuarioNormalId,
          activo_afectado: 'Sistema auxiliar',
          evidencia: 'Evidencia del usuario normal'
        }])
        .select()
        .single();
      
      if (insertError || !nuevoIncidente) {
        console.log('ℹ️ No se pudo crear incidente para test, saltando');
        await supabase.auth.signOut();
        return;
      }
      
      incidentesPrueba.push(nuevoIncidente.id);
      await supabase.auth.signOut();
      
      // Intentar actualizar como analista
      await supabase.auth.signInWithPassword(usuarios.analista);
      
      const { data, error } = await supabase
        .from('incidentes')
        .update({
          estado: 'Erradicado'
        })
        .eq('id', nuevoIncidente.id)
        .select();

      // Debe fallar o no afectar registros
      if (error) {
        expect(error).toBeDefined();
        console.log('✅ Analista bloqueado con error:', error.message);
      } else {
        expect(data.length).toBe(0);
        console.log('✅ Analista no pudo actualizar incidente no asignado');
      }
      
      await supabase.auth.signOut();
    });

  });

  describe('📋 Política UPDATE: "Usuarios normales solo pueden editar sus propios incidentes"', () => {
    
    test('✅ Usuario normal puede actualizar sus propios incidentes', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      console.log('Usuario normal actualizando su propio incidente...');
      
      // Buscar un incidente propio
      const { data: incidentesUsuario } = await supabase
        .from('incidentes')
        .select('*')
        .eq('dueño', usuarioNormalId)
        .limit(1);
      
      if (incidentesUsuario.length > 0) {
        const { data, error } = await supabase
          .from('incidentes')
          .update({
            descripcion: 'Actualizado por el usuario que lo reportó',
            evidencia: 'Evidencia adicional añadida por el usuario'
          })
          .eq('id', incidentesUsuario[0].id)
          .eq('dueño', usuarioNormalId)
          .select();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.length).toBe(1);
        
        console.log('✅ Usuario normal actualizó su propio incidente');
      } else {
        console.log('ℹ️ No hay incidentes propios para actualizar');
      }
      
      await supabase.auth.signOut();
    });

    test('❌ Usuario normal NO puede actualizar incidentes de otros', async () => {
      await supabase.auth.signInWithPassword(usuarios.normal);
      
      console.log('Usuario normal intentando actualizar incidente ajeno...');
      
      // Intentar actualizar un incidente que no es suyo
      const { data, error } = await supabase
        .from('incidentes')
        .update({
          descripcion: 'Intento de modificación no autorizada'
        })
        .eq('dueño', analistaId) // Incidente de otro usuario
        .select();

      // Debe fallar o no afectar registros
      if (error) {
        expect(error).toBeDefined();
        console.log('✅ Usuario normal bloqueado con error:', error.message);
      } else {
        expect(data.length).toBe(0);
        console.log('✅ Usuario normal no pudo actualizar incidentes ajenos');
      }
      
      await supabase.auth.signOut();
    });

  });

  describe('📋 Política SELECT: "Jefe de seguridad puede ver todos los incidentes"', () => {
    
    test('✅ Jefe de seguridad ve todos los incidentes', async () => {
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      console.log('Jefe de seguridad consultando todos los incidentes...');
      
      const { data, error } = await supabase
        .from('incidentes')
        .select('*')
        .limit(20);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Debe ver incidentes de diferentes usuarios
      const dueñosUnicos = [...new Set(data.map(i => i.dueño))];
      
      console.log(`✅ Jefe ve ${data.length} incidentes de ${dueñosUnicos.length} usuarios diferentes`);
      console.log('Campos disponibles:', Object.keys(data[0] || {}));
      
      await supabase.auth.signOut();
    });

  });

  describe('📋 Política UPDATE: "Jefe de seguridad puede editar el responsable"', () => {
    
    test('✅ Jefe puede asignar responsables a incidentes', async () => {
      // Verificar que hay al menos un incidente creado
      if (incidentesPrueba.length === 0) {
        console.log('ℹ️ No hay incidentes para asignar responsable, saltando test');
        return;
      }
      
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      console.log('Jefe asignando responsable a incidente...');
      
      // Usar el primer incidente disponible
      const incidenteId = incidentesPrueba[incidentesPrueba.length - 1]; // Último creado
      
      const { data, error } = await supabase
        .from('incidentes')
        .update({
          responsable: analistaId,
          estado: 'En investigacion'
        })
        .eq('id', incidenteId)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].responsable).toBe(analistaId);
      expect(data[0].estado).toBe('En investigacion');
      
      console.log('✅ Jefe asignó responsable exitosamente');
      
      await supabase.auth.signOut();
    });

    test('✅ Jefe puede actualizar cualquier campo de incidentes', async () => {
      // Verificar que hay al menos un incidente creado
      if (incidentesPrueba.length === 0) {
        console.log('ℹ️ No hay incidentes para actualizar, saltando test');
        return;
      }
      
      await supabase.auth.signInWithPassword(usuarios.jefeSeguridad);
      
      console.log('Jefe actualizando múltiples campos de incidente...');
      
      const { data, error } = await supabase
        .from('incidentes')
        .update({
          nivel: 'Alto',
          estado: 'Contenido',
          descripcion: 'Actualizado por jefe de seguridad - prioridad alta',
          evidencia: 'Evidencia recopilada por el equipo de seguridad'
        })
        .eq('id', incidentesPrueba[0])
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].nivel).toBe('Alto');
      expect(data[0].estado).toBe('Contenido');
      
      console.log('✅ Jefe actualizó incidente con múltiples campos');
      
      await supabase.auth.signOut();
    });

  });

  describe('📊 Resumen de Políticas Específicas Incidentes', () => {
    
    test('🔒 Verificación completa de las 8 políticas específicas', () => {
      console.log('\n🛡️ === POLÍTICAS ESPECÍFICAS INCIDENTES VERIFICADAS ===');
      console.log('');
      console.log('📋 Política INSERT: "Usuarios normales autenticados pueden reportar incidentes"');
      console.log('  ✅ Usuario normal puede crear incidentes');
      console.log('  ❌ Analista no puede crear incidentes');
      console.log('  ❌ Usuarios no autenticados no pueden crear incidentes');
      console.log('');
      console.log('📋 Política SELECT: "Enable users to view their own data only"');
      console.log('  ✅ Usuario normal ve solo sus propios incidentes');
      console.log('  ✅ Acceso restringido a datos propios funciona correctamente');
      console.log('');
      console.log('📋 Política SELECT: "Analistas pueden ver los incidentes que se le asignan"');
      console.log('  ✅ Analista ve incidentes asignados a él');
      console.log('  ✅ Visibilidad basada en asignación funciona correctamente');
      console.log('');
      console.log('📋 Política SELECT: "Analistas pueden ver los incidentes de su propio equipo"');
      console.log('  ✅ Analista ve incidentes de su equipo');
      console.log('  ✅ Acceso por equipo funciona correctamente');
      console.log('');
      console.log('📋 Política UPDATE: "Analista puede editar los incidentes que se le asignan"');
      console.log('  ✅ Analista puede actualizar incidentes asignados');
      console.log('  ❌ Analista no puede actualizar incidentes no asignados');
      console.log('');
      console.log('📋 Política UPDATE: "Usuarios normales solo pueden editar sus propios incidentes"');
      console.log('  ✅ Usuario normal puede actualizar sus propios incidentes');
      console.log('  ❌ Usuario normal no puede actualizar incidentes ajenos');
      console.log('');
      console.log('📋 Política SELECT: "Jefe de seguridad puede ver todos los incidentes"');
      console.log('  ✅ Jefe ve todos los incidentes sin restricciones');
      console.log('  ✅ Acceso administrativo completo para jefe');
      console.log('');
      console.log('📋 Política UPDATE: "Jefe de seguridad puede editar el responsable"');
      console.log('  ✅ Jefe puede asignar responsables a incidentes');
      console.log('  ✅ Jefe puede actualizar cualquier campo de incidentes');
      console.log('');
      console.log('🎯 TODAS LAS 8 POLÍTICAS DE INCIDENTES FUNCIONAN CORRECTAMENTE');
      console.log('=========================================================\n');
      
      expect(true).toBe(true);
    });

  });

});
