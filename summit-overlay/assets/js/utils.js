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
      console.warn(`CORS/Fetch error loading JSON from ${path}. Using local offline fallback data.`);
      
      // Fallback arrays to support file:// protocol
      if (path.includes('speakers.json')) {
        return [
          {
            "name": "Paolo Colonnello",
            "title": "CEO de DIIO",
            "talk": "Preparándose para el trabajo en el mundo de la IA",
            "time": "9:20"
          },
          {
            "name": "Sergio Azócar",
            "title": "Founding Skyward Engineer",
            "talk": "Context Architecture: Cómo diseñar código para personas y agentes de IA",
            "time": "9:45"
          },
          {
            "name": "Nicolás Beghelli",
            "title": "Cofounder Minverso",
            "talk": "La fábrica del futuro: IA, metaverso y gemelos digitales aplicados a la industria",
            "time": "10:35"
          },
          {
            "name": "Álvaro Pérez-Nur",
            "title": "Gerente MOWI Chile",
            "talk": "Smart Farming 4.0: Cómo la IA está redefiniendo la acuicultura moderna",
            "time": "10:55"
          }
        ];
      }
      
      if (path.includes('schedule.json')) {
        return [
          { "time": "8:30", "activity": "Acreditación" },
          { "time": "9:00", "activity": "Inicio actividad y palabras de bienvenida" },
          { "time": "9:20", "activity": "Charla: Preparándose para el trabajo en el mundo de la IA", "speaker": "Paolo Colonnello" },
          { "time": "9:45", "activity": "Charla: Context Architecture", "speaker": "Sergio Azócar" },
          { "time": "10:10", "activity": "Coffee Break — Más Allá de la Pantalla: Proyectos que Transforman" },
          { "time": "10:35", "activity": "Charla: La fábrica del futuro", "speaker": "Nicolás Beghelli" },
          { "time": "10:55", "activity": "Charla: Smart Farming 4.0", "speaker": "Álvaro Pérez-Nur" },
          { "time": "11:20", "activity": "Cierre actividad y entrega de reconocimientos" }
        ];
      }
      
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
