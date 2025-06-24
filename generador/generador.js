// Establecer fecha actual por defecto
document.getElementById('fechaCreacion').value = new Date().toISOString().split('T')[0];
// Establecer fecha de vencimiento 10 días después
const vencimiento = new Date();
vencimiento.setDate(vencimiento.getDate() + 10);
document.getElementById('fechaVencimiento').value = vencimiento.toISOString().split('T')[0];

function addItemManoObra() {
    const container = document.getElementById('itemsManoObraContainer');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" placeholder="Descripción de la mano de obra" class="item-desc-mano">
        <input type="number" placeholder="Precio" class="item-price-mano"
               oninput="calculateTotals()">
        <input type="number" placeholder="Cant." class="item-qty-mano" value="1"
               oninput="calculateTotals()">
        <input type="number" placeholder="Total" class="item-total-mano" readonly>
        <button class="remove-btn" onclick="removeItem(this)">×</button>
    `;
    container.appendChild(newItem);
}

function addItem() {
    const container = document.getElementById('itemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" placeholder="Descripción del servicio" class="item-desc">
        <input type="number" placeholder="Precio" class="item-price" oninput="calculateTotals()">
        <input type="number" placeholder="Cant." class="item-qty" value="1"
               oninput="calculateTotals()">
        <input type="number" placeholder="Total" class="item-total" readonly>
        <button class="remove-btn" onclick="removeItem(this)">×</button>
    `;
    container.appendChild(newItem);
}

function removeItem(button) {
    if (document.querySelectorAll('.item-row').length > 1) {
        button.parentElement.remove();
        calculateTotals();
    }
}

function calculateTotals() {
    const items = document.querySelectorAll('.item-row');
    let totalRepuestos = 0;
    let totalManoObraItems = 0;

    // Suma de repuestos
    document.querySelectorAll('#itemsContainer .item-row').forEach(item => {
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        const qty = parseFloat(item.querySelector('.item-qty').value) || 1;
        const total = price * qty;
        item.querySelector('.item-total').value = total;
        totalRepuestos += total;
    });

    // Suma de mano de obra
    document.querySelectorAll('#itemsManoObraContainer .item-row').forEach(item => {
        const price = parseFloat(item.querySelector('.item-price-mano').value) || 0;
        const qty = parseFloat(item.querySelector('.item-qty-mano').value) || 1;
        const total = price * qty;
        item.querySelector('.item-total-mano').value = total;
        totalManoObraItems += total;
    });

    const totalManoObra = totalManoObraItems;
    const totalFinal = totalRepuestos + totalManoObra;

    document.getElementById('totalRepuestos').textContent = `$${totalRepuestos.toLocaleString()}`;
    document.getElementById('totalManoObra').textContent = `$${totalManoObra.toLocaleString()}`;
    document.getElementById('totalFinal').textContent = `$${totalFinal.toLocaleString()}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Función auxiliar para dividir texto largo en múltiples líneas
function splitText(doc, text, maxWidth, fontSize = 8) {
    doc.setFontSize(fontSize);
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = doc.getTextWidth(testLine);
        
        if (textWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

// Función para agregar header en nuevas páginas
function addPageHeader(doc, pageNumber) {
    if (pageNumber > 1) {
        // Colores
        const yellowColor = [255, 193, 7];
        const grayColor = [40, 40, 40];
        
        // Header simplificado para páginas adicionales
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('NEUMÁTICOS AG - PRESUPUESTO (Continuación)', 20, 20);
        
        // Número de página
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${pageNumber}`, 170, 20);
        
        // Headers de la tabla
        let yPosition = 30;
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
        
        doc.setTextColor(0, 0, 0);

        //Volvemos al estilo normal
        doc.setFont('helvetica', 'normal'); 
        doc.setFontSize(8); 
        doc.setTextColor(0, 0, 0); 

        return yPosition + 8;
    }
    return 0;
}

// Función para agregar footer
function addPageFooter(doc, pageNumber, telefono) {
    const grayColor = [40, 40, 40];
    
    doc.setFillColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`neumaticosag2025@gmail.com ${telefono}`, 20, 290);
    doc.text('@neumaticosag', 160, 290);
    doc.text(`Página ${pageNumber}`, 185, 290);
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Colores
    const yellowColor = [255, 193, 7];
    const lightGray = [245, 245, 245];
    const grayColor = [40, 40, 40];
    const darkGray = [20, 20, 20];
    
    // Configuración de páginas
    const pageHeight = 297; //297 -> A4 height en mm
    const footerHeight = 40;
    const maxYPosition = pageHeight - footerHeight + 25; 
    let currentPage = 1;
    let yPosition = 90;

    // PÁGINA 1 - Header completo
    doc.addImage('Logo.png', 'PNG', 20, 10, 40, 35);
    
    // Header - NEUMÁTICOS AG
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('NEUMÁTICOS AG', 100, 25);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESUPUESTO', 140, 38);
    
    // Información del presupuesto
    const numeroPresupuesto = document.getElementById('numeroPresupuesto').value || 'N° 001-000123';
    const fechaCreacion = formatDate(document.getElementById('fechaCreacion').value);
    const fechaVencimiento = formatDate(document.getElementById('fechaVencimiento').value);
    
    doc.setFontSize(10);
    doc.text(`N° ${numeroPresupuesto}`, 140, 45);
    doc.text(`Fecha: ${fechaCreacion}`, 140, 52);
    doc.text(`Vencimiento: ${fechaVencimiento}`, 140, 59);
    
    // Información del cliente
    doc.setTextColor(yellowColor[0], yellowColor[1], yellowColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', 20, 49);
    doc.setTextColor(0, 0, 0);
    
    const cliente = document.getElementById('cliente').value || 'Nombre del Cliente';
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
    
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
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
const itemsManoObra = document.querySelectorAll('#itemsManoObraContainer .item-row');
const items = document.querySelectorAll('#itemsContainer .item-row');

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
    const desc = item.querySelector('.item-desc-mano').value || '';
    const price = parseFloat(item.querySelector('.item-price-mano').value) || 0;
    const qty = parseFloat(item.querySelector('.item-qty-mano').value) || 1;
    const total = price * qty;

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
    const desc = item.querySelector('.item-desc').value || '';
    const price = parseFloat(item.querySelector('.item-price').value) || 0;
    const qty = parseFloat(item.querySelector('.item-qty').value) || 1;
    const total = price * qty;

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
    const totalRepuestos = document.getElementById('totalRepuestos').textContent;
    const totalManoObra = document.getElementById('totalManoObra').textContent;
    const totalFinal = document.getElementById('totalFinal').textContent;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Repuestos total aprox.', 120, yPosition + 12);
    doc.text(totalRepuestos, 165, yPosition + 12);
    doc.text('Mano de obra total', 120, yPosition + 18);
    doc.text(totalManoObra, 165, yPosition + 18);

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
    doc.text(totalFinal, 185, yPosition + 32, { align: 'right' });

    // Footer final
    addPageFooter(doc, currentPage, telefono);

    // Descargar PDF
    const fileName = `Presupuesto_${cliente.replace(/\s+/g, '_')}_${fechaCreacion.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);

    alert("✅ PDF generado correctamente");

    // Crear JSON con los datos
    const presupuestoJSON = {
        cliente: cliente,
        patente: document.getElementById('patente').value || "",
        numero: numeroPresupuesto,
        fecha: fechaCreacion,
        vencimiento: fechaVencimiento,
        manoObra: Array.from(document.querySelectorAll('#itemsManoObraContainer .item-row')).map(item => ({
            descripcion: item.querySelector('.item-desc-mano').value,
            precio: parseFloat(item.querySelector('.item-price-mano').value) || 0,
            cantidad: parseFloat(item.querySelector('.item-qty-mano').value) || 1,
            total: parseFloat(item.querySelector('.item-total-mano').value) || 0
        })),
        repuestos: Array.from(document.querySelectorAll('#itemsContainer .item-row')).map(item => ({
            descripcion: item.querySelector('.item-desc').value,
            precio: parseFloat(item.querySelector('.item-price').value) || 0,
            cantidad: parseFloat(item.querySelector('.item-qty').value) || 1,
            total: parseFloat(item.querySelector('.item-total').value) || 0
        })),
        telefono: document.getElementById('telefono').value || '',
        email: document.getElementById('email').value || '',
    };

    // Enviar JSON a través de un form oculto (sin CORS)
    document.getElementById('jsonDataInput').value = JSON.stringify(presupuestoJSON);
    document.getElementById('uploadForm').submit();
}

// Calcular totales al cargar la página
calculateTotals();