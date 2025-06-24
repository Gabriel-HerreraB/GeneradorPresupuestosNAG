let presupuestos = [];
let presupuestosFiltrados = [];
let idPresupuestoActual = null;

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
    const cliente = document.getElementById('filtroCliente').value.trim();
    const patente = document.getElementById('filtroPatente').value.trim();
    const fechaDesde = document.getElementById('filtroFechaDesde').value;
    const fechaHasta = document.getElementById('filtroFechaHasta').value;

    const loadingDiv = document.getElementById('loadingIndicator');
    loadingDiv.style.display = 'block';

    const queryParams = new URLSearchParams({
    action: 'buscar',
    cliente,
    patente,
    fechaDesde,
    fechaHasta
    });

    try {
    const response = await fetch(SCRIPT_URL_SEARCH + '?' + queryParams.toString(), {
        method: 'GET',
        mode: 'cors'
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (data.success) {
        presupuestos = data.presupuestos || [];
        presupuestosFiltrados = [...presupuestos];
        mostrarResultados();
        actualizarContador();
    } else {
        throw new Error(data.error || 'Error al buscar');
    }
    } catch (error) {
    mostrarError('Error al buscar presupuestos: ' + error.message);
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-accion btn-descargar" onclick="descargarPresupuesto('${presupuesto.id}')" title="Descargar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
                <button class="btn-accion btn-editar" onclick="editarPresupuesto('${presupuesto.id}')" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button class="btn-accion btn-eliminar" onclick="eliminarPresupuesto('${presupuesto.id}')" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black"><path d="M3 6h18M8 6V4h8v2m-6 0v14m4-14v14M5 6v14h14V6"/></svg>
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
        total += presupuesto.manoObra.reduce(
                    (sum, item) => sum + (item.precio * item.cantidad), 0
                );
    }
    
    if (presupuesto.repuestos && Array.isArray(presupuesto.repuestos)) {
        total += presupuesto.repuestos.reduce(
                    (sum, item) => sum + (item.precio * item.cantidad), 0
                );
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

        // Generar el PDF con jsPDF y obtenerlo como blob
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // === Lógica de armado del PDF ===
        generatePDFContent(doc, presupuesto); // separás la lógica en una función aparte

        // Convertir el PDF a blob y abrir en otra ventana
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);

        window.open(blobUrl, '_blank');

    } catch (error) {
        console.error('Error al ver presupuesto:', error);
        alert('Error al generar el PDF: ' + error.message);
    }
}

async function descargarPresupuesto(id) {
    try {
        const presupuesto = presupuestos.find(p => p.id === id);
        if (!presupuesto) {
            alert('Presupuesto no encontrado');
            return;
        }

        const loadingDiv = document.getElementById('loadingIndicator');
        loadingDiv.style.display = 'block';

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Generar el contenido del PDF
        generatePDFContent(doc, presupuesto);

        // Descargar el PDF directamente
        doc.save(`Presupuesto_${presupuesto.cliente.replace(/\s+/g, '_')}_${presupuesto.fecha.replace(/\//g, '-')}.pdf`);
        
    } catch (error) {
        console.error('Error al descargar presupuesto:', error);
        alert('Error al generar el PDF: ' + error.message);
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
        idPresupuestoActual = id; // Guardar el ID del presupuesto actual
        abrirGeneradorModal(presupuesto)

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

        const formData = new URLSearchParams();
        formData.append('action', 'eliminar');
        formData.append('id', id);

        const response = await fetch(SCRIPT_URL_SEARCH, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            alert('Presupuesto eliminado correctamente');
            cargarPresupuestos();
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

let itemNumber = 1;
let isAlternate = false;

function generatePDFContent(doc, presupuesto) {
    const yellowColor = [255, 193, 7];
    const grayColor = [40, 40, 40];
    const darkGray = [20, 20, 20];
    const lightGray = [245, 245, 245];

    // Configuración de páginas
    const pageHeight = 297; //297 -> A4 height en mm
    const footerHeight = 40;
    const maxYPosition = pageHeight - footerHeight + 25; 
    let currentPage = 1;
    let yPosition = 90;
    let page = 1;

    let totalRepuestos = 0;
    let totalManoObra = 0;
    let totalFinal = 0;

    
    // Armás el PDF como hacías antes, pero usando `presupuesto` en lugar de elementos del DOM
    doc.addImage('Logo.png', 'PNG', 20, 10, 40, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.text('NEUMÁTICOS AG', 100, 25);

    doc.setFontSize(18);
    doc.text('PRESUPUESTO', 140, 38);

    doc.setFontSize(10);
    doc.text(`N° ${presupuesto.numero}`, 140, 45);
    doc.text(`Fecha: ${presupuesto.fecha}`, 140, 52);
    doc.text(`Vencimiento: ${presupuesto.vencimiento}`, 140, 59);

    // Información del cliente
    doc.setTextColor(yellowColor[0], yellowColor[1], yellowColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', 20, 49);
    doc.setTextColor(0, 0, 0);
    
    const cliente = presupuesto.cliente || 'Nombre del Cliente';
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(cliente, 20, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Dueño | Neumáticos AG', 20, 62);
    
    doc.setTextColor(yellowColor[0], yellowColor[1], yellowColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PERSONA DE CONTACTO', 20, 70);
    doc.setTextColor(0, 0, 0);
    
    const telefono = presupuesto.telefono || '(351) 817-6692';
    const email = presupuesto.email || 'agosgulli9@gmail.com';
    doc.setFont('helvetica', 'bold');
    doc.text(`Teléfono: ${telefono}`, 20, 75);
    doc.text(`Email: ${email}`, 20, 80);

    // Headers de la tabla
    doc.setFillColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.rect(20, yPosition, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 22, yPosition + 5);
    doc.text('DESCRIPCIÓN', 35, yPosition + 5);
    doc.text('PRECIO', 120, yPosition + 5);
    doc.text('CANTIDAD', 140, yPosition + 5);
    doc.text('TOTAL', 165, yPosition + 5);
    yPosition += 8;
    
doc.setTextColor(0, 0, 0);
doc.setFont('helvetica', 'normal');

// Obtener los ítems
const itemsManoObra = presupuesto.manoObra || [];
const items = presupuesto.repuestos || [];

let itemNumber = 1;
let isAlternate = false;

// Verificar si necesitamos nueva página
function checkNewPage(requiredHeight = 16) {
    if (yPosition + requiredHeight > maxYPosition) {
        addPageFooter(doc, currentPage, telefono);
        doc.addPage();
        currentPage++;
        yPosition = 20; // No dibujamos header todavía
        isAlternate = false;
    }
}

// Función para agregar encabezado si es necesario
function ensureTableHeader() {
    if (yPosition === 20) {
        yPosition = addPageHeader(doc, currentPage);
    }
}

// === Procesar items de MANO DE OBRA ===
itemsManoObra.forEach((item) => {
    const desc = item.descripcion ||  '';
    const price = item.precio || 0;
    const qty = item.cantidad || 1;
    const total = price * qty;
    totalManoObra += total;
    if (desc || price > 0) {
        const descLines = splitText(doc, desc, 80, 8);
        const itemHeight = Math.max(8, descLines.length * 4 + 4);

        checkNewPage(itemHeight);
        ensureTableHeader();

        if (isAlternate) {
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.rect(20, yPosition, 170, itemHeight, 'F');
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        doc.line(20, yPosition + itemHeight, 190, yPosition + itemHeight);
        doc.line(20, yPosition, 20, yPosition + itemHeight);
        doc.line(32, yPosition, 32, yPosition + itemHeight);
        doc.line(118, yPosition, 118, yPosition + itemHeight);
        doc.line(138, yPosition, 138, yPosition + itemHeight);
        doc.line(160, yPosition, 160, yPosition + itemHeight);
        doc.line(190, yPosition, 190, yPosition + itemHeight);

        doc.setFontSize(8);
        doc.text(itemNumber.toString(), 22, yPosition + 5);
        descLines.forEach((line, i) => doc.text(line, 35, yPosition + 5 + (i * 4)));
        doc.text(`$${price.toLocaleString()}`, 120, yPosition + 5);
        doc.text(qty.toString(), 145, yPosition + 5);
        doc.text(`$${total.toLocaleString()}`, 165, yPosition + 5);

        yPosition += itemHeight;
        itemNumber++;
        isAlternate = !isAlternate;
    }
});

// === Línea divisoria entre secciones ===
checkNewPage(4);
doc.setDrawColor(0, 0, 0); // negro
doc.setLineWidth(0.5);
doc.line(20, yPosition, 190, yPosition);
yPosition += 0.5;
doc.setLineWidth(0.5);

// === Procesar items de REPUESTOS ===
items.forEach((item) => {
    const desc = item.descripcion ||  '';
    const price = item.precio || 0;
    const qty = item.cantidad || 1;
    const total = price * qty;
    totalRepuestos += total;
    if (desc || price > 0) {
        const descLines = splitText(doc, desc, 80, 8);
        const itemHeight = Math.max(8, descLines.length * 4 + 4);

        checkNewPage(itemHeight);
        ensureTableHeader();

        if (isAlternate) {
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.rect(20, yPosition, 170, itemHeight, 'F');
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        doc.line(20, yPosition + itemHeight, 190, yPosition + itemHeight);
        doc.line(20, yPosition, 20, yPosition + itemHeight);
        doc.line(32, yPosition, 32, yPosition + itemHeight);
        doc.line(118, yPosition, 118, yPosition + itemHeight);
        doc.line(138, yPosition, 138, yPosition + itemHeight);
        doc.line(160, yPosition, 160, yPosition + itemHeight);
        doc.line(190, yPosition, 190, yPosition + itemHeight);

        doc.setFontSize(8);
        doc.text(itemNumber.toString(), 22, yPosition + 5);
        descLines.forEach((line, i) => doc.text(line, 35, yPosition + 5 + (i * 4)));
        doc.text(`$${price.toLocaleString()}`, 120, yPosition + 5);
        doc.text(qty.toString(), 145, yPosition + 5);
        doc.text(`$${total.toLocaleString()}`, 165, yPosition + 5);

        yPosition += itemHeight;
        itemNumber++;
        isAlternate = !isAlternate;
    }
});

    // Verificar espacio para totales y aclaraciones (necesitamos ~60mm)
    checkNewPage(60);
    
    // ACLARACIONES Y CONDICIONES + TOTALES
    yPosition += 10;
    
    // Aclaraciones
    doc.setTextColor(yellowColor[0], yellowColor[1], yellowColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ACLARACIONES IMPORTANTES', 20, yPosition + 4);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const aclaracionText = [
        'El precio de los repuestos es un aproximado ya que',
        'para comprar el repuesto hace falta llevar la muestra,',
        'por lo cual puede existir variación en el precio de los',
        'mismos.'
    ];
    
    aclaracionText.forEach((line, index) => {
        doc.text(line, 20, yPosition + 9 + (index * 4));
    });

    // Condiciones de pago
    const condicionesY = yPosition + 15;
    doc.setTextColor(yellowColor[0], yellowColor[1], yellowColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDICIONES DE PAGO', 22, condicionesY + 15);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const condicionesText = [
        'Los precios pasados son en efectivo o transferencia,',
        'en el caso de pagar con tarjeta se sumará el interés',
        'de la misma dependiendo los pagos elegidos.'
    ];
    
    condicionesText.forEach((line, index) => {
        doc.text(line, 20, condicionesY + 20 + (index * 4));
    });

    // Totales
    totalFinal = totalRepuestos + totalManoObra;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Repuestos total aprox.', 120, yPosition + 12);
    doc.text(`$${totalRepuestos.toLocaleString()}`, 165, yPosition + 12);
    doc.text('Mano de obra total', 120, yPosition + 18);
    doc.text(`$${totalManoObra.toLocaleString()}`, 165, yPosition + 18);

    // Línea divisoria
    doc.setDrawColor(150, 150, 150);
    doc.line(120, yPosition + 22, 190, yPosition + 22);

    // Total final
    doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.rect(120, yPosition + 24, 70, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 125, yPosition + 32);
    doc.text(`$${totalFinal.toLocaleString()}`, 185, yPosition + 32, { align: 'right' });

    // Footer final
    addPageFooter(doc, currentPage, telefono);
}

async function abrirGeneradorModal(presupuesto) {
    // Mostrar modal
    document.getElementById('generadorModal').style.display = 'block';

    // Rellenar campos base
    document.getElementById('cliente').value = presupuesto.cliente || '';
    document.getElementById('numeroPresupuesto').value = presupuesto.numero || '';
    document.getElementById('fechaCreacion').value = formatearFechaParaInput(presupuesto.fecha);
    document.getElementById('fechaVencimiento').value = formatearFechaParaInput(presupuesto.vencimiento);
    document.getElementById('patente').value = presupuesto.patente || '';
    document.getElementById('telefono').value = presupuesto.contactoNumero || '';
    document.getElementById('email').value = presupuesto.contactoEmail || '';

    // Limpiar items previos
    document.getElementById('itemsManoObraContainer').innerHTML = '';
    document.getElementById('itemsContainer').innerHTML = '';

    // Cargar items de mano de obra
    (presupuesto.manoObra || []).forEach(item => {
        addItemManoObra(item.descripcion, item.precio, item.cantidad);
    });

    // Cargar repuestos
    (presupuesto.repuestos || []).forEach(item => {
        addItem(item.descripcion, item.precio, item.cantidad);
    });

    calculateTotals(); // Actualizar totales
}
function addItemManoObra(desc = '', precio = '', cantidad = 1) {
    const container = document.getElementById('itemsManoObraContainer');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" class="item-desc-mano" placeholder="Descripción" value="${desc}">
        <input type="number" class="item-price-mano" placeholder="Precio" value="${precio}" oninput="calculateTotals()">
        <input type="number" class="item-qty-mano" placeholder="Cant." value="${cantidad}" oninput="calculateTotals()">
        <input type="number" class="item-total-mano" placeholder="Total" readonly>
        <button class="remove-btn" onclick="removeItem(this)">×</button>
    `;
    container.appendChild(row);
}

function addItem(desc = '', precio = '', cantidad = 1) {
    const container = document.getElementById('itemsContainer');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" class="item-desc" placeholder="Descripción" value="${desc}">
        <input type="number" class="item-price" placeholder="Precio" value="${precio}" oninput="calculateTotals()">
        <input type="number" class="item-qty" placeholder="Cant." value="${cantidad}" oninput="calculateTotals()">
        <input type="number" class="item-total" placeholder="Total" readonly>
        <button class="remove-btn" onclick="removeItem(this)">×</button>
    `;
    container.appendChild(row);
}
function cerrarGeneradorModal() {
    document.getElementById('generadorModal').style.display = 'none';
}

async function generatePDF() {
    try {
    const presupuesto = recolectarDatosDelFormulario();
    const idExistente = idPresupuestoActual;

    // Eliminar archivo anterior si estamos editando
    if (idExistente) {
       /*  await fetch(SCRIPT_URL_SEARCH, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'eliminar', id: idExistente })
        }); */

        const formData = new URLSearchParams();
        formData.append('action', 'eliminar');
        formData.append('id', idExistente);

        await fetch(SCRIPT_URL_SEARCH, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
    }

    // Generar nuevo PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    generatePDFContent(doc, presupuesto);

    const pdfBlob = doc.output('blob');

    const response = await fetch(SCRIPT_URL_SEARCH, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=guardar&json=${encodeURIComponent(JSON.stringify(presupuesto))}`
    });

    if (!response.ok) throw new Error('Error al subir el nuevo presupuesto');

    alert('Presupuesto generado y guardado correctamente');
    cerrarGeneradorModal(); // opcional
    cargarPresupuestos();   // si querés refrescar la lista

    } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Hubo un error: ' + error.message);
    }
}

function recolectarDatosDelFormulario() {
    const presupuesto = {
        //id: document.getElementById('presupuestoId').value || null,
        cliente: document.getElementById('cliente').value || '',
        numero: document.getElementById('numeroPresupuesto').value || '',
        fecha: document.getElementById('fechaCreacion').value || '',
        vencimiento: document.getElementById('fechaVencimiento').value || '',
        patente: document.getElementById('patente').value || '',
        telefono: document.getElementById('telefono').value || '',
        email: document.getElementById('email').value || '',
        manoObra: [],
        repuestos: []
    };

    // Recolectar items de mano de obra
    const manoObraRows = document.querySelectorAll('#itemsManoObraContainer .item-row');
    manoObraRows.forEach(row => {
        const descripcion = row.querySelector('.item-desc-mano')?.value || '';
        const precio = parseFloat(row.querySelector('.item-price-mano')?.value) || 0;
        const cantidad = parseInt(row.querySelector('.item-qty-mano')?.value) || 1;

        presupuesto.manoObra.push({ descripcion, precio, cantidad });
    });

    // Recolectar items de repuestos
    const repuestosRows = document.querySelectorAll('#itemsContainer .item-row');
    repuestosRows.forEach(row => {
        const descripcion = row.querySelector('.item-desc')?.value || '';
        const precio = parseFloat(row.querySelector('.item-price')?.value) || 0;
        const cantidad = parseInt(row.querySelector('.item-qty')?.value) || 1;

        presupuesto.repuestos.push({ descripcion, precio, cantidad });
    });

    return presupuesto;
}
function formatearFechaParaInput(fechaStr) {
    if (!fechaStr) return '';
    
    const [dia, mes, anio] = fechaStr.split('/');
    return `${anio}-${mes}-${dia}`;
}
