// Configuración de páginas
const pages = {
    generador: {
        html: 'generador/generador.html',
        css: 'generador/generador.css',
        js: 'generador/generador.js'
    },
    buscador: {
        html: 'buscador/buscador.html',
        css: 'buscador/buscador.css',
        js: 'buscador/buscador.js'
    }
};

let currentPage = null;
let loadedStyles = new Set();
let loadedScripts = new Set();

// Función para cargar CSS dinámicamente
function loadCSS(href) {
    return new Promise((resolve, reject) => {
        if (loadedStyles.has(href)) {
            resolve();
            return;
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => {
            loadedStyles.add(href);
            resolve();
        };
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

// Función para cargar JavaScript dinámicamente
function loadJS(src) {
    return new Promise((resolve, reject) => {
        if (loadedScripts.has(src)) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loadedScripts.add(src);
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

// Función para cargar HTML
function loadHTML(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    });
}

// Función principal para cargar página
async function loadPage(pageName) {
    if (currentPage === pageName) return;
    
    const container = document.getElementById('content-container');
    const pageConfig = pages[pageName];
    
    if (!pageConfig) {
        console.error(`Página '${pageName}' no encontrada`);
        return;
    }
    
    try {
        // Mostrar loading
        container.innerHTML = '<div class="loading">Cargando página...</div>';
        
        // Cargar recursos en paralelo
        const promises = [
            loadHTML(pageConfig.html)
        ];
        
        if (pageConfig.css) {
            promises.push(loadCSS(pageConfig.css));
        }
        
        const [htmlContent] = await Promise.all(promises);
        
        // Insertar HTML
        container.innerHTML = htmlContent;
        
        // Cargar JavaScript después del HTML
        if (pageConfig.js) {
            await loadJS(pageConfig.js);
            if (pageName === 'buscador' && typeof initializeBuscador === 'function') {
                initializeBuscador(); 
            }
        }
        
        // Actualizar navegación
        updateNavigation(pageName);
        currentPage = pageName;
        
        console.log(`Página '${pageName}' cargada exitosamente`);
        
        
    } catch (error) {
        console.error(`Error cargando página '${pageName}':`, error);
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #e74c3c;">
                <h3>Error al cargar la página</h3>
                <p>No se pudo cargar la página '${pageName}'. Por favor, intenta nuevamente.</p>
                <button onclick="loadPage('${pageName}')" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Función para actualizar la navegación
function updateNavigation(activePage) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === activePage) {
            btn.classList.add('active');
        }
    });
}

// Event listeners para navegación
document.addEventListener('DOMContentLoaded', () => {
    // Configurar eventos de navegación
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = btn.dataset.page;
            loadPage(pageName);
        });
    });
    
    // Cargar página inicial (generador por defecto)
    loadPage('generador');
});

// Función auxiliar para limpiar recursos al cambiar de página
function cleanupCurrentPage() {
    // Aquí puedes agregar lógica para limpiar eventos, timers, etc.
    // específicos de cada página antes de cambiar
    if (currentPage) {
        console.log(`Limpiando página: ${currentPage}`);
    }
}