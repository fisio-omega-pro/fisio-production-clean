const { db, Timestamp } = require('./config/firebase');

async function limpiarDatosUsuario() {
  try {
    console.log('🧹 LIMPIEZA COMPLETA DE DATOS - aunquedemanera@gmail.com');
    console.log('='.repeat(60));
    
    // 1. Buscar clínica por email
    const clinicasSnapshot = await db.collection('clinicas').where('email', '==', 'aunquedemanera@gmail.com').get();
    
    if (clinicasSnapshot.empty) {
      console.log('❌ No se encontró clínica con email aunquedemanera@gmail.com');
      return;
    }
    
    const clinicaDoc = clinicasSnapshot.docs[0];
    const clinicaId = clinicaDoc.id;
    const clinicaData = clinicaDoc.data();
    
    console.log('📋 Clínica encontrada:', clinicaData.nombre_clinica);
    console.log('🆔 ID:', clinicaId);
    
    // 2. Eliminar pacientes
    console.log('\n👥 Eliminando pacientes...');
    const pacientesSnapshot = await db.collection('pacientes').where('clinic_id', '==', clinicaId).get();
    console.log('📊 Pacientes a eliminar:', pacientesSnapshot.size);
    
    if (pacientesSnapshot.size > 0) {
      const batch = db.batch();
      pacientesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Pacientes eliminados');
    }
    
    // 3. Eliminar citas
    console.log('\n📅 Eliminando citas...');
    const citasSnapshot = await db.collection('citas').where('clinic_id', '==', clinicaId).get();
    console.log('📊 Citas a eliminar:', citasSnapshot.size);
    
    if (citasSnapshot.size > 0) {
      const batch2 = db.batch();
      citasSnapshot.docs.forEach(doc => {
        batch2.delete(doc.ref);
      });
      await batch2.commit();
      console.log('✅ Citas eliminadas');
    }
    
    // 4. Eliminar bonos
    console.log('\n💰 Eliminando bonos...');
    const bonosSnapshot = await db.collection('bonos').where('clinic_id', '==', clinicaId).get();
    console.log('📊 Bonos a eliminar:', bonosSnapshot.size);
    
    if (bonosSnapshot.size > 0) {
      const batch3 = db.batch();
      bonosSnapshot.docs.forEach(doc => {
        batch3.delete(doc.ref);
      });
      await batch3.commit();
      console.log('✅ Bonos eliminados');
    }
    
    // 5. Eliminar facturas
    console.log('\n💳 Eliminando facturas...');
    const facturasSnapshot = await db.collection('facturas').where('clinic_id', '==', clinicaId).get();
    console.log('📊 Facturas a eliminar:', facturasSnapshot.size);
    
    if (facturasSnapshot.size > 0) {
      const batch4 = db.batch();
      facturasSnapshot.docs.forEach(doc => {
        batch4.delete(doc.ref);
      });
      await batch4.commit();
      console.log('✅ Facturas eliminadas');
    }
    
    // 6. Eliminar notas
    console.log('\n📝 Eliminando notas...');
    const notasSnapshot = await db.collection('notas').where('clinic_id', '==', clinicaId).get();
    console.log('📊 Notas a eliminar:', notasSnapshot.size);
    
    if (notasSnapshot.size > 0) {
      const batch5 = db.batch();
      notasSnapshot.docs.forEach(doc => {
        batch5.delete(doc.ref);
      });
      await batch5.commit();
      console.log('✅ Notas eliminadas');
    }
    
    // 7. Eliminar tickets de soporte
    console.log('\n🎫 Eliminando tickets de soporte...');
    const ticketsSnapshot = await db.collection('tickets').where('clinic_id', '==', clinicaId).get();
    console.log('📊 Tickets a eliminar:', ticketsSnapshot.size);
    
    if (ticketsSnapshot.size > 0) {
      const batch6 = db.batch();
      ticketsSnapshot.docs.forEach(doc => {
        batch6.delete(doc.ref);
      });
      await batch6.commit();
      console.log('✅ Tickets eliminados');
    }
    
    // 8. Eliminar sugerencias
    console.log('\n💡 Eliminando sugerencias...');
    const sugerenciasSnapshot = await db.collection('sugerencias').where('clinic_id', '==', clinicaId).get();
    console.log('📊 Sugerencias a eliminar:', sugerenciasSnapshot.size);
    
    if (sugerenciasSnapshot.size > 0) {
      const batch7 = db.batch();
      sugerenciasSnapshot.docs.forEach(doc => {
        batch7.delete(doc.ref);
      });
      await batch7.commit();
      console.log('✅ Sugerencias eliminadas');
    }
    
    // 9. Limpiar datos de la clínica (mantener solo registro básico)
    console.log('\n🏥 Limpiando datos de la clínica...');
    
    const datosBasicos = {
      nombre_clinica: clinicaData.nombre_clinica || 'Clínica de Prueba',
      email: clinicaData.email,
      status: 'registrada',
      fecha_registro: clinicaData.fecha_registro || Timestamp.now(),
      plan: clinicaData.plan || 'trial',
      trial_ends: clinicaData.trial_ends || null,
      subscription_id: clinicaData.subscription_id || null,
      stripe_customer_id: clinicaData.stripe_customer_id || null,
      // Eliminar todos los demás datos
      telefono: null,
      direccion: null,
      ciudad: null,
      provincia: null,
      cp: null,
      cif: null,
      logo_url: null,
      descripcion: null,
      web: null,
      social_media: null,
      settings: null,
      team_members: null,
      specialties: null,
      equipment: null,
      schedule: null,
      payment_settings: null,
      notification_settings: null,
      integrations: null,
      metadata: null,
      updated_at: Timestamp.now(),
      limpiado_para_validacion: true
    };
    
    await db.collection('clinicas').doc(clinicaId).update(datosBasicos);
    console.log('✅ Clínica limpiada - solo datos básicos mantenidos');
    
    // 10. Verificación final
    console.log('\n🔍 VERIFICACIÓN FINAL:');
    
    const verificaciones = [
      { coleccion: 'pacientes', snapshot: await db.collection('pacientes').where('clinic_id', '==', clinicaId).get() },
      { coleccion: 'citas', snapshot: await db.collection('citas').where('clinic_id', '==', clinicaId).get() },
      { coleccion: 'bonos', snapshot: await db.collection('bonos').where('clinic_id', '==', clinicaId).get() },
      { coleccion: 'facturas', snapshot: await db.collection('facturas').where('clinic_id', '==', clinicaId).get() },
      { coleccion: 'notas', snapshot: await db.collection('notas').where('clinic_id', '==', clinicaId).get() },
      { coleccion: 'tickets', snapshot: await db.collection('tickets').where('clinic_id', '==', clinicaId).get() },
      { coleccion: 'sugerencias', snapshot: await db.collection('sugerencias').where('clinic_id', '==', clinicaId).get() }
    ];
    
    verificaciones.forEach(v => {
      console.log(`📊 ${v.coleccion}: ${v.snapshot.size} registros (debe ser 0)`);
    });
    
    console.log('\n🎉 LIMPIEZA COMPLETADA');
    console.log('✅ Todos los datos eliminados excepto registro básico');
    console.log('📧 Clínica lista para validación final');
    console.log('🆔 ID de clínica para pruebas:', clinicaId);
    
  } catch (error) {
    console.error('🔥 Error en limpieza:', error);
  }
}

limpiarDatosUsuario();
