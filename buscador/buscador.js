let presupuestos = [];
let presupuestosFiltrados = [];

// Configuración de Google Apps Script para el buscador
const SCRIPT_URL_SEARCH = 'https://script.google.com/macros/s/AKfycbyLwSEu6uYWjBM0-OrYQbXb6G9H4aV2TehSWCh0W9Yf_B3yKtrvSkuVXZ9Fbyy0uutsjQ/exec';

// Inicializar el buscador cuando se carga la página
//initializeBuscador();

function initializeBuscador() {
    // Cargar presupuestos al inicializar
    //cargarPresupuestos();
    
    // Event listeners para filtros
    document.getElementById('filtroCliente').addEventListener('input', filtrarPresupuestos);
    document.getElementById('filtroPatente').addEventListener('input', filtrarPresupuestos);
    document.getElementById('filtroFechaDesde').addEventListener('change', filtrarPresupuestos);
    document.getElementById('filtroFechaHasta').addEventListener('change', filtrarPresupuestos);
    
    // Event listener para el botón de búsqueda
    document.getElementById('btnBuscar').addEventListener('click', cargarPresupuestos);
    
    // Event listener para limpiar filtros
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
}

// Función para cargar presupuestos desde Google Drive
async function cargarPresupuestos() {
    const loadingDiv = document.getElementById('loadingIndicator');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    
    try {
        loadingDiv.style.display = 'block';
        resultadosDiv.innerHTML = '';
        
        // Realizar petición a Google Apps Script
        const response = await fetch(SCRIPT_URL_SEARCH + '?action=listar', {
            method: 'GET',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            presupuestos = data.presupuestos || [];
            presupuestosFiltrados = [...presupuestos];
            mostrarResultados();
            actualizarContador();
        } else {
            throw new Error(data.error || 'Error desconocido al cargar presupuestos');
        }
        
    } catch (error) {
        console.error('Error cargando presupuestos:', error);
        mostrarError('Error al cargar los presupuestos: ' + error.message);
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// Función para filtrar presupuestos
function filtrarPresupuestos() {
    const filtroCliente = document.getElementById('filtroCliente').value.toLowerCase().trim();
    const filtroPatente = document.getElementById('filtroPatente').value.toLowerCase().trim();
    const filtroFechaDesde = document.getElementById('filtroFechaDesde').value;
    const filtroFechaHasta = document.getElementById('filtroFechaHasta').value;
    
    presupuestosFiltrados = presupuestos.filter(presupuesto => {
        // Filtro por cliente
        if (filtroCliente && !presupuesto.cliente.toLowerCase().includes(filtroCliente)) {
            return false;
        }
        
        // Filtro por patente
        if (filtroPatente && !presupuesto.patente.toLowerCase().includes(filtroPatente)) {
            return false;
        }
        
        // Filtro por fecha desde
        if (filtroFechaDesde) {
            const fechaPresupuesto = new Date(presupuesto.fecha.split('/').reverse().join('-'));
            const fechaDesde = new Date(filtroFechaDesde);
            if (fechaPresupuesto < fechaDesde) {
                return false;
            }
        }
        
        // Filtro por fecha hasta
        if (filtroFechaHasta) {
            const fechaPresupuesto = new Date(presupuesto.fecha.split('/').reverse().join('-'));
            const fechaHasta = new Date(filtroFechaHasta);
            if (fechaPresupuesto > fechaHasta) {
                return false;
            }
        }
        
        return true;
    });
    
    mostrarResultados();
    actualizarContador();
}

// Función para mostrar los resultados en la tabla
function mostrarResultados() {
    const tbody = document.getElementById('tablaPresupuestos');
    tbody.innerHTML = '';
    
    if (presupuestosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-results">
                    <div class="no-results-content">
                        <span>📄</span>
                        <p>No se encontraron presupuestos</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    presupuestosFiltrados.forEach((presupuesto, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${presupuesto.numero || 'N/A'}</td>
            <td>${presupuesto.cliente}</td>
            <td>${presupuesto.patente || 'N/A'}</td>
            <td>${presupuesto.fecha}</td>
            <td>${presupuesto.vencimiento}</td>
            <td>$${calcularTotal(presupuesto).toLocaleString()}</td>
            <td class="acciones">
                <button class="btn-accion btn-ver" onclick="verPresupuesto('${presupuesto.id}')" title="Ver">
                    👁️
                </button>
                <button class="btn-accion btn-descargar" onclick="descargarPresupuesto('${presupuesto.id}')" title="Descargar">
                    📥
                </button>
                <button class="btn-accion btn-editar" onclick="editarPresupuesto('${presupuesto.id}')" title="Editar">
                    ✏️
                </button>
                <button class="btn-accion btn-eliminar" onclick="eliminarPresupuesto('${presupuesto.id}')" title="Eliminar">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para calcular el total del presupuesto
function calcularTotal(presupuesto) {
    let total = 0;
    
    if (presupuesto.manoObra && Array.isArray(presupuesto.manoObra)) {
        total += presupuesto.manoObra.reduce((sum, item) => sum + (item.total || 0), 0);
    }
    
    if (presupuesto.repuestos && Array.isArray(presupuesto.repuestos)) {
        total += presupuesto.repuestos.reduce((sum, item) => sum + (item.total || 0), 0);
    }
    
    return total;
}

// Función para actualizar el contador de resultados
function actualizarContador() {
    const contador = document.getElementById('contadorResultados');
    contador.textContent = `${presupuestosFiltrados.length} de ${presupuestos.length} presupuestos`;
}

// Función para limpiar filtros
function limpiarFiltros() {
    document.getElementById('filtroCliente').value = '';
    document.getElementById('filtroPatente').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    
    presupuestosFiltrados = [...presupuestos];
    mostrarResultados();
    actualizarContador();
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    resultadosDiv.innerHTML = `
        <div class="error-message">
            <span>⚠️</span>
            <p>${mensaje}</p>
            <button onclick="cargarPresupuestos()" class="btn-retry">Reintentar</button>
        </div>
    `;
}

// Acciones para los presupuestos
async function verPresupuesto(id) {
    try {
        const presupuesto = presupuestos.find(p => p.id === id);
        if (!presupuesto) {
            alert('Presupuesto no encontrado');
            return;
        }
        
        // Abrir en nueva ventana con los datos del presupuesto
        const ventana = window.open('', '_blank', 'width=800,height=600');
        ventana.document.write(generarVistaPresupuesto(presupuesto));
        
    } catch (error) {
        console.error('Error al ver presupuesto:', error);
        alert('Error al abrir el presupuesto: ' + error.message);
    }
}

async function descargarPresupuesto(id) {
    try {
        const loadingDiv = document.getElementById('loadingIndicator');
        loadingDiv.style.display = 'block';
        
        const response = await fetch(SCRIPT_URL_SEARCH + `?action=descargar&id=${id}`, {
            method: 'GET',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `presupuesto_${id}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
    } catch (error) {
        console.error('Error al descargar presupuesto:', error);
        alert('Error al descargar el presupuesto: ' + error.message);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function editarPresupuesto(id) {
    try {
        const presupuesto = presupuestos.find(p => p.id === id);
        if (!presupuesto) {
            alert('Presupuesto no encontrado');
            return;
        }
        
        // Guardar datos en localStorage para el generador
        localStorage.setItem('editarPresupuesto', JSON.stringify(presupuesto));
        
        // Cambiar a la página del generador
        if (typeof loadPage === 'function') {
            loadPage('generador');
        } else {
            alert('Función de navegación no disponible. Guarda estos datos y ve al generador manualmente.');
        }
        
    } catch (error) {
        console.error('Error al editar presupuesto:', error);
        alert('Error al cargar el presupuesto para edición: ' + error.message);
    }
}

async function eliminarPresupuesto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const loadingDiv = document.getElementById('loadingIndicator');
        loadingDiv.style.display = 'block';
        
        const response = await fetch(SCRIPT_URL_SEARCH, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'eliminar',
                id: id
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            alert('Presupuesto eliminado correctamente');
            cargarPresupuestos(); // Recargar la lista
        } else {
            throw new Error(data.error || 'Error desconocido al eliminar');
        }
        
    } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        alert('Error al eliminar el presupuesto: ' + error.message);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// Función para generar la vista HTML del presupuesto
function generarVistaPresupuesto(presupuesto) {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Presupuesto ${presupuesto.numero} - ${presupuesto.cliente}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .info-section h3 { color: #333; margin-bottom: 10px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items-table th { background-color: #f2f2f2; }
                .totals { text-align: right; font-weight: bold; }
                .total-final { background-color: #333; color: white; padding: 10px; text-align: right; font-size: 18px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>NEUMÁTICOS AG</h1>
                    <h2>PRESUPUESTO</h2>
                </div>
                
                <div class="info-grid">
                    <div class="info-section">
                        <h3>Información del Presupuesto</h3>
                        <p><strong>Número:</strong> ${presupuesto.numero}</p>
                        <p><strong>Fecha:</strong> ${presupuesto.fecha}</p>
                        <p><strong>Vencimiento:</strong> ${presupuesto.vencimiento}</p>
                    </div>
                    <div class="info-section">
                        <h3>Información del Cliente</h3>
                        <p><strong>Cliente:</strong> ${presupuesto.cliente}</p>
                        <p><strong>Patente:</strong> ${presupuesto.patente || 'N/A'}</p>
                    </div>
                </div>
                
                ${presupuesto.manoObra && presupuesto.manoObra.length > 0 ? `
                <h3>Mano de Obra</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${presupuesto.manoObra.map(item => `
                            <tr>
                                <td>${item.descripcion}</td>
                                <td>$${item.precio.toLocaleString()}</td>
                                <td>${item.cantidad}</td>
                                <td>$${item.total.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : ''}
                
                ${presupuesto.repuestos && presupuesto.repuestos.length > 0 ? `
                <h3>Repuestos</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${presupuesto.repuestos.map(item => `
                            <tr>
                                <td>${item.descripcion}</td>
                                <td>$${item.precio.toLocaleString()}</td>
                                <td>${item.cantidad}</td>
                                <td>$${item.total.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : ''}
                
                <div class="total-final">
                    TOTAL: $${calcularTotal(presupuesto).toLocaleString()}
                </div>
            </div>
        </body>
        </html>
    `;
}