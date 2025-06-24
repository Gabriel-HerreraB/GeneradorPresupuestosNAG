// Variables globales para el contador
let manoObraCounter = 1;
let repuestosCounter = 1;
let relationships = [];

// Establecer fechas por defecto al cargar
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fechaCreacion').value = new Date().toISOString().split('T')[0];
    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + 10);
    document.getElementById('fechaVencimiento').value = vencimiento.toISOString().split('T')[0];
    calculateTotals();
});

// Función para agregar nueva sección de Mano de Obra
function addManoObraSection() {
    const container = document.getElementById('manoObraContainer');
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'items-section';
    sectionDiv.setAttribute('data-section-type', 'mano-obra');
    sectionDiv.setAttribute('data-section-id', manoObraCounter);
    
    sectionDiv.innerHTML = `
        <div class="items-header">
            <h3>Items de Mano de Obra ${manoObraCounter}</h3>
            <div class="section-controls">
                <button class="add-item-btn" onclick="addItemManoObra(${manoObraCounter})">+ Agregar Mano de Obra</button>
                <button class="remove-section-btn" onclick="removeManoObraSection(${manoObraCounter})">× Eliminar Sección</button>
            </div>
        </div>
        <div id="itemsManoObraContainer${manoObraCounter}">
            <div class="item-row">
                <input type="text" placeholder="Descripción de la mano de obra" class="item-desc-mano">
                <input type="number" placeholder="Precio" class="item-price-mano" oninput="calculateTotals()">
                <input type="number" placeholder="Cant." class="item-qty-mano" value="1" oninput="calculateTotals()">
                <input type="number" placeholder="Total" class="item-total-mano" readonly>
                <button class="remove-btn" onclick="removeItem(this)">×</button>
            </div>
        </div>
        <div class="section-total">
            <span>Total Sección: <span id="totalManoObra${manoObraCounter}">$0</span></span>
        </div>
    `;
    
    container.appendChild(sectionDiv);
    manoObraCounter++;
    updateRelationshipOptions();
}

// Función para agregar nueva sección de Repuestos
function addRepuestosSection() {
    const container = document.getElementById('repuestosContainer');
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'items-section';
    sectionDiv.setAttribute('data-section-type', 'repuestos');
    sectionDiv.setAttribute('data-section-id', repuestosCounter);
    
    const letter = String.fromCharCode(64 + repuestosCounter); // A, B, C, etc.
    
    sectionDiv.innerHTML = `
        <div class="items-header">
            <h3>Items de Repuestos ${letter}</h3>
            <div class="section-controls">
                <button class="add-item-btn" onclick="addItem(${repuestosCounter})">+ Agregar Repuesto</button>
                <button class="remove-section-btn" onclick="removeRepuestosSection(${repuestosCounter})">× Eliminar Sección</button>
            </div>
        </div>
        <div id="itemsContainer${repuestosCounter}">
            <div class="item-row">
                <input type="text" placeholder="Descripción del servicio" class="item-desc">
                <input type="number" placeholder="Precio" class="item-price" oninput="calculateTotals()">
                <input type="number" placeholder="Cant." class="item-qty" value="1" oninput="calculateTotals()">
                <input type="number" placeholder="Total" class="item-total" readonly>
                <button class="remove-btn" onclick="removeItem(this)">×</button>
            </div>
        </div>
        <div class="section-total">
            <span>Total Sección: <span id="totalRepuestos${repuestosCounter}">$0</span></span>
        </div>
    `;
    
    container.appendChild(sectionDiv);
    repuestosCounter++;
    updateRelationshipOptions();
}

// Función para eliminar sección de Mano de Obra
function removeManoObraSection(sectionId) {
    const section = document.querySelector(`[data-section-type="mano-obra"][data-section-id="${sectionId}"]`);
    if (section && document.querySelectorAll('[data-section-type="mano-obra"]').length > 1) {
        section.remove();
        // Remover relaciones que incluyan esta sección
        relationships = relationships.filter(rel => rel.manoObra !== sectionId);
        updateRelationshipOptions();
        calculateTotals();
    }
}

// Función para eliminar sección de Repuestos
function removeRepuestosSection(sectionId) {
    const section = document.querySelector(`[data-section-type="repuestos"][data-section-id="${sectionId}"]`);
    if (section && document.querySelectorAll('[data-section-type="repuestos"]').length > 1) {
        section.remove();
        // Remover relaciones que incluyan esta sección
        relationships = relationships.filter(rel => rel.repuestos !== sectionId);
        updateRelationshipOptions();
        calculateTotals();
    }
}

// Función para agregar item de mano de obra a una sección específica
function addItemManoObra(sectionId) {
    const container = document.getElementById(`itemsManoObraContainer${sectionId}`);
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" placeholder="Descripción de la mano de obra" class="item-desc-mano">
        <input type="number" placeholder="Precio" class="item-price-mano" oninput="calculateTotals()">
        <input type="number" placeholder="Cant." class="item-qty-mano" value="1" oninput="calculateTotals()">
        <input type="number" placeholder="Total" class="item-total-mano" readonly>
        <button class="remove-btn" onclick="removeItem(this)">×</button>
    `;
    container.appendChild(newItem);
}

// Función para agregar item de repuesto a una sección específica
function addItem(sectionId) {
    const container = document.getElementById(`itemsContainer${sectionId}`);
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" placeholder="Descripción del servicio" class="item-desc">
        <input type="number" placeholder="Precio" class="item-price" oninput="calculateTotals()">
        <input type="number" placeholder="Cant." class="item-qty" value="1" oninput="calculateTotals()">
        <input type="number" placeholder="Total" class="item-total" readonly>
        <button class="remove-btn" onclick="removeItem(this)">×</button>
    `;
    container.appendChild(newItem);
}

// Función para remover item individual
function removeItem(button) {
    const itemRow = button.parentElement;
    const container = itemRow.parentElement;
    
    if (container.querySelectorAll('.item-row').length > 1) {
        button.parentElement.remove();
        calculateTotals();
    }
}

// Función para actualizar las opciones de relaciones
function updateRelationshipOptions() {
    const manoObraSelect = document.getElementById('manoObraSelect');
    const repuestosSelect = document.getElementById('repuestosSelect');
    
    // Limpiar opciones existentes
    manoObraSelect.innerHTML = '<option value="">Seleccionar Mano de Obra</option>';
    repuestosSelect.innerHTML = '<option value="">Seleccionar Repuestos</option>';
    
    // Agregar opciones de Mano de Obra
    document.querySelectorAll('[data-section-type="mano-obra"]').forEach(section => {
        const sectionId = section.getAttribute('data-section-id');
        const option = document.createElement('option');
        option.value = sectionId;
        option.textContent = `Mano de Obra ${sectionId}`;
        manoObraSelect.appendChild(option);
    });
    
    // Agregar opciones de Repuestos
    document.querySelectorAll('[data-section-type="repuestos"]').forEach(section => {
        const sectionId = section.getAttribute('data-section-id');
        const letter = String.fromCharCode(64 + parseInt(sectionId));
        const option = document.createElement('option');
        option.value = sectionId;
        option.textContent = `Repuestos ${letter}`;
        repuestosSelect.appendChild(option);
    });
}

// Función para agregar relación
function addRelationship() {
    const manoObraId = document.getElementById('manoObraSelect').value;
    const repuestosId = document.getElementById('repuestosSelect').value;
    
    if (!manoObraId || !repuestosId) {
        alert('Debe seleccionar ambas secciones para crear una relación');
        return;
    }
    
    // Verificar que no exista ya esta relación
    const existingRelation = relationships.find(rel => 
        rel.manoObra == manoObraId && rel.repuestos == repuestosId
    );
    
    if (existingRelation) {
        alert('Esta relación ya existe');
        return;
    }
    
    relationships.push({
        manoObra: parseInt(manoObraId),
        repuestos: parseInt(repuestosId)
    });
    
    updateRelationshipsList();
    calculateTotals();
    
    // Limpiar selects
    document.getElementById('manoObraSelect').value = '';
    document.getElementById('repuestosSelect').value = '';
}

// Función para actualizar la lista de relaciones
function updateRelationshipsList() {
    const container = document.getElementById('relationshipsList');
    container.innerHTML = '';
    
    relationships.forEach((rel, index) => {
        const letter = String.fromCharCode(64 + rel.repuestos);
        const relationDiv = document.createElement('div');
        relationDiv.className = 'relationship-item';
        relationDiv.innerHTML = `
            <span>Mano de Obra ${rel.manoObra} + Repuestos ${letter}</span>
            <button onclick="removeRelationship(${index})" class="remove-btn">×</button>
        `;
        container.appendChild(relationDiv);
    });
}

// Función para remover relación
function removeRelationship(index) {
    relationships.splice(index, 1);
    updateRelationshipsList();
    calculateTotals();
}

// Función para calcular totales
function calculateTotals() {
    // Calcular totales por sección
    document.querySelectorAll('[data-section-type="mano-obra"]').forEach(section => {
        const sectionId = section.getAttribute('data-section-id');
        let sectionTotal = 0;
        
        section.querySelectorAll('.item-row').forEach(item => {
            const price = parseFloat(item.querySelector('.item-price-mano').value) || 0;
            const qty = parseFloat(item.querySelector('.item-qty-mano').value) || 1;
            const total = price * qty;
            item.querySelector('.item-total-mano').value = total;
            sectionTotal += total;
        });
        
        const totalElement = document.getElementById(`totalManoObra${sectionId}`);
        if (totalElement) {
            totalElement.textContent = `$${sectionTotal.toLocaleString()}`;
        }
    });
    
    document.querySelectorAll('[data-section-type="repuestos"]').forEach(section => {
        const sectionId = section.getAttribute('data-section-id');
        let sectionTotal = 0;
        
        section.querySelectorAll('.item-row').forEach(item => {
            const price = parseFloat(item.querySelector('.item-price').value) || 0;
            const qty = parseFloat(item.querySelector('.item-qty').value) || 1;
            const total = price * qty;
            item.querySelector('.item-total').value = total;
            sectionTotal += total;
        });
        
        const totalElement = document.getElementById(`totalRepuestos${sectionId}`);
        if (totalElement) {
            totalElement.textContent = `$${sectionTotal.toLocaleString()}`;
        }
    });
    
    // Calcular totales de relaciones
    updateRelationshipTotals();
}

// Función para calcular totales de relaciones
function updateRelationshipTotals() {
    const container = document.getElementById('relationshipTotals');
    container.innerHTML = '';
    
    let grandTotal = 0;
    
    relationships.forEach((rel, index) => {
        const manoObraTotal = getSectionTotal('mano-obra', rel.manoObra);
        const repuestosTotal = getSectionTotal('repuestos', rel.repuestos);
        const relationTotal = manoObraTotal + repuestosTotal;
        grandTotal += relationTotal;
        
        const letter = String.fromCharCode(64 + rel.repuestos);
        const totalDiv = document.createElement('div');
        totalDiv.className = 'relation-total';
        totalDiv.innerHTML = `
            <span>Mano de Obra ${rel.manoObra} + Repuestos ${letter}:</span>
            <span>$${relationTotal.toLocaleString()}</span>
        `;
        container.appendChild(totalDiv);
    });
}

// Función auxiliar para obtener total de una sección
function getSectionTotal(type, sectionId) {
    const section = document.querySelector(`[data-section-type="${type}"][data-section-id="${sectionId}"]`);
    if (!section) return 0;
    
    let total = 0;
    const selector = type === 'mano-obra' ? '.item-total-mano' : '.item-total';
    
    section.querySelectorAll(selector).forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    return total;
}

// Función para formatear fecha
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
        const yellowColor = [255, 193, 7];
        const grayColor = [40, 40, 40];
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('NEUMÁTICOS AG - PRESUPUESTO (Continuación)', 20, 20);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${pageNumber}`, 170, 20);
        
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
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
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

// Función principal para generar PDF
function generatePDF() {
    if (relationships.length === 0) {
        alert('Debe crear al menos una relación entre Mano de Obra y Repuestos para generar el PDF');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Colores
    const yellowColor = [255, 193, 7];
    const lightGray = [245, 245, 245];
    const grayColor = [40, 40, 40];
    const darkGray = [20, 20, 20];
    
    // Configuración de páginas
    const pageHeight = 297;
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
    
    let itemNumber = 1;
    let isAlternate = false;
    
    // Verificar si necesitamos nueva página
    function checkNewPage(requiredHeight = 16) {
        if (yPosition + requiredHeight > maxYPosition) {
            addPageFooter(doc, currentPage, telefono);
            doc.addPage();
            currentPage++;
            yPosition = 20;
            isAlternate = false;
        }
    }
    
    // Función para agregar encabezado si es necesario
    function ensureTableHeader() {
        if (yPosition === 20) {
            yPosition = addPageHeader(doc, currentPage);
        }
    }
    
    // Procesar cada relación
    relationships.forEach((rel, relationIndex) => {
        // Agregar título de la relación
        checkNewPage(12);
        ensureTableHeader();
        
        const letter = String.fromCharCode(64 + rel.repuestos);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(yellowColor[0], yellowColor[1], yellowColor[2]);
        doc.text(`Presupuesto: ${relationIndex + 1}`, 20, yPosition + 6);
        yPosition += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        // Procesar items de Mano de Obra de esta relación
        const manoObraSection = document.querySelector(`[data-section-type="mano-obra"][data-section-id="${rel.manoObra}"]`);
        if (manoObraSection) {
            manoObraSection.querySelectorAll('.item-row').forEach((item) => {
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
        }
        
        // Línea divisoria entre mano de obra y repuestos
        checkNewPage(4);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 0.5;
        
        // Procesar items de Repuestos de esta relación
        const repuestosSection = document.querySelector(`[data-section-type="repuestos"][data-section-id="${rel.repuestos}"]`);
        if (repuestosSection) {
            repuestosSection.querySelectorAll('.item-row').forEach((item) => {
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
        }
        
        // Línea divisoria entre relaciones (si no es la última)
        if (relationIndex < relationships.length - 1) {
            checkNewPage(8);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.line(20, yPosition + 4, 190, yPosition + 4);
            yPosition += 8;
        }
    });
    
    // Verificar espacio para totales y aclaraciones
    checkNewPage(80);
    
    // ACLARACIONES Y CONDICIONES + TOTALES
    yPosition += 15;
    
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
    
    // Totales de relaciones
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let totalYPosition = yPosition + 12;
    
    relationships.forEach((rel, index) => {
        const manoObraTotal = getSectionTotal('mano-obra', rel.manoObra);
        const repuestosTotal = getSectionTotal('repuestos', rel.repuestos);
        const relationTotal = manoObraTotal + repuestosTotal;
        const letter = String.fromCharCode(64 + rel.repuestos);
        
        doc.text(`Mano de Obra ${rel.manoObra} + Repuestos ${letter}`, 120, totalYPosition);
        doc.text(`${relationTotal.toLocaleString()}`, 165, totalYPosition);
        totalYPosition += 6;
    });
    
    // Línea divisoria
    doc.setDrawColor(150, 150, 150);
    doc.line(120, totalYPosition + 2, 190, totalYPosition + 2);
    
    // Total final
    const grandTotal = parseFloat(document.getElementById('totalFinal').textContent.replace(/[$,]/g, '')) || 0;
    doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.rect(120, totalYPosition + 4, 70, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 125, totalYPosition + 12);
    doc.text(`${grandTotal.toLocaleString()}`, 185, totalYPosition + 12, { align: 'right' });
    
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
        relaciones: relationships.map(rel => ({
            manoObraId: rel.manoObra,
            repuestosId: rel.repuestos,
            manoObra: Array.from(document.querySelectorAll(`#itemsManoObraContainer${rel.manoObra} .item-row`)).map(item => ({
                descripcion: item.querySelector('.item-desc-mano').value,
                precio: parseFloat(item.querySelector('.item-price-mano').value) || 0,
                cantidad: parseFloat(item.querySelector('.item-qty-mano').value) || 1,
                total: parseFloat(item.querySelector('.item-total-mano').value) || 0
            })),
            repuestos: Array.from(document.querySelectorAll(`#itemsContainer${rel.repuestos} .item-row`)).map(item => ({
                descripcion: item.querySelector('.item-desc').value,
                precio: parseFloat(item.querySelector('.item-price').value) || 0,
                cantidad: parseFloat(item.querySelector('.item-qty').value) || 1,
                total: parseFloat(item.querySelector('.item-total').value) || 0
            }))
        })),
        telefono: document.getElementById('telefono').value || '',
        email: document.getElementById('email').value || '',
        totalFinal: grandTotal
    };
    
    // Enviar JSON a través de un form oculto (sin CORS)
    document.getElementById('jsonDataInput').value = JSON.stringify(presupuestoJSON);
    document.getElementById('uploadForm').submit();
}