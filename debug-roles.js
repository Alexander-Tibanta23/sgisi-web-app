// Script de debugging para verificar los roles en la base de datos
// Ejecutar en la consola del navegador después de hacer login

// Función para verificar la estructura de la tabla profiles
async function debugRoles() {
  try {
    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return;
    }
    
    if (!user) {
      console.log('No user logged in');
      return;
    }
    
    console.log('Current user:', user.id, user.email);
    
    // Obtener datos del perfil con todas las columnas
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log('Profile data:', profileData);
    console.log('Profile error:', profileError);
    
    // Verificar qué columnas existen
    if (profileData) {
      console.log('Available columns:', Object.keys(profileData));
      console.log('Role field (rol):', profileData.rol);
      console.log('Role field (role):', profileData.role);
      console.log('Role field (user_role):', profileData.user_role);
    }
    
    // Obtener todos los perfiles para ver la estructura general
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    console.log('Sample profiles:', allProfiles);
    console.log('Sample profiles error:', allError);
    
  } catch (error) {
    console.error('Error in debugRoles:', error);
  }
}

// Ejecutar la función
debugRoles();

console.log('Debug script loaded. Run debugRoles() to check roles.');
