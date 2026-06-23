/**
 * Utilities and Helpers for SummIT Overlays
 */

const Utils = {
  /**
   * Obtiene un parámetro de la URL por su nombre.
   * @param {string} name - Nombre del parámetro
   * @param {string} [url] - URL a evaluar (por defecto la actual)
   * @returns {string|null} - Valor del parámetro o null si no existe
   */
  getQueryParam(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  },

  /**
   * Carga un archivo JSON de forma segura.
   * @param {string} path - Ruta al archivo JSON
   * @returns {Promise<any>} - Promesa con el JSON parseado
   */
  async loadJSON(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.error(`Error loading JSON from ${path}:`, e);
      return null;
    }
  },

  /**
   * Carga la base de datos de speakers.
   * @returns {Promise<Array<object>|null>}
   */
  async getSpeakers() {
    return await this.loadJSON('../data/speakers.json');
  },

  /**
   * Carga el cronograma de actividades.
   * @returns {Promise<Array<object>|null>}
   */
  async getSchedule() {
    return await this.loadJSON('../data/schedule.json');
  },

  /**
   * Ejecuta un fade out completo de la escena al terminar su tiempo útil.
   * Útil para OBS Browser Sources que necesitan transicionar de forma transparente.
   * @param {number} delayMs - Retardo antes de iniciar el fade out (en milisegundos)
   * @param {Function} [callback] - Callback opcional al finalizar el fade out
   */
  setupSceneAutoFadeOut(delayMs, callback) {
    setTimeout(() => {
      document.body.classList.add('fade-out-active');
      
      // Esperar a que la transición CSS termine (definida en base.css como 1s)
      setTimeout(() => {
        if (typeof callback === 'function') {
          callback();
        }
        // Desencadenar el evento animationend estándar para control externo en OBS si aplica
        const event = new CustomEvent('overlay-transition-complete', {
          detail: { scene: window.location.pathname.split('/').pop() }
        });
        window.dispatchEvent(event);
        console.log('OBS Overlay: Scene fade-out complete.');
      }, 1000);
    }, delayMs);
  },

  /**
   * Obtiene las iniciales de un nombre para usar como avatar alternativo.
   * @param {string} name - Nombre completo
   * @returns {string} - Iniciales (ej: "Paolo Colonnello" -> "PC")
   */
  getInitials(name) {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
};
