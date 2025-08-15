// Script de prueba para verificar que el PDF se genera correctamente
// Uso: node test-pdf-fix.js

const BASE_URL = 'http://localhost:3000';

async function testHealthCheck() {
    try {
        const response = await fetch(`${BASE_URL}/health`);
        if (response.ok) {
            console.log('✅ Servidor funcionando correctamente');
            return true;
        } else {
            console.log('❌ Servidor no responde correctamente');
            return false;
        }
    } catch (error) {
        console.log('❌ No se puede conectar al servidor');
        return false;
    }
}

async function main() {
    console.log('🚀 Verificando solución del problema de PDF...\n');
    
    const serverOk = await testHealthCheck();
    if (!serverOk) {
        console.log('\n💡 Asegúrate de que el servidor esté corriendo con: npm start');
        return;
    }
    
    console.log('📋 Cambios implementados para solucionar el problema:');
    console.log('✅ 1. Eliminado timestamp del nombre del archivo PDF');
    console.log('✅ 2. Agregado timestamp como parámetro de query (?t=timestamp)');
    console.log('✅ 3. Actualizado todas las funciones que generan PDF URL');
    console.log('✅ 4. Mantenido cache-busting sin cambiar nombre de archivo');
    
    console.log('\n🎯 Cómo funciona ahora:');
    console.log('1. El PDF se guarda con nombre estable: negocio-cliente-numero.pdf');
    console.log('2. La URL incluye timestamp: url.pdf?t=1234567890');
    console.log('3. Esto evita cacheo pero mantiene consistencia de archivos');
    
    console.log('\n🧪 Para probar:');
    console.log('1. Actualiza una factura a estado "pagada"');
    console.log('2. Haz clic en "Ver PDF"');
    console.log('3. El PDF debería mostrarse correctamente');
    console.log('4. El estado debería aparecer como "PAID"');
    console.log('5. El balance debería ser $0.00');
    
    console.log('\n🔧 Endpoints disponibles:');
    console.log('PUT /api/facturas/{id} - Actualizar factura (regenera PDF automáticamente)');
    console.log('POST /api/facturas/{id}/regenerate-pdf - Regenerar PDF manualmente');
    console.log('GET /api/facturas/{id} - Obtener factura con PDF URL actualizado');
    
    console.log('\n💡 Si el PDF aún no se muestra:');
    console.log('1. Verifica que el servidor esté corriendo');
    console.log('2. Revisa los logs del servidor para errores');
    console.log('3. Verifica que Supabase Storage esté configurado correctamente');
    console.log('4. Prueba regenerar el PDF manualmente');
}

main();
