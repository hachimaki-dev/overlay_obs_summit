/**
 * Circuits Background Generator for SummIT Overlays
 * Programmatically builds and animates SVG PCB circuits on a 1920x1080 viewport.
 */

class CircuitsBG {
  constructor(containerSelector = '.circuits-layer', options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.warn(`CircuitsBG: Container '${containerSelector}' not found.`);
      return;
    }
    this.options = Object.assign({
      theme: 'gold', // 'gold', 'magenta', or 'mixed'
      pulseDuration: 2,
    }, options);

    this.svg = null;
    this.paths = [];
    this.nodes = [];
    this.init();
  }

  init() {
    // Crear el elemento SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('viewBox', '0 0 1920 1080');
    this.svg.setAttribute('class', 'circuit-svg');
    this.container.appendChild(this.svg);

    // Definición de caminos (PCB tracks) con 45 grados
    // Coordenadas pensadas para una pantalla de 1920x1080
    // Algunas líneas van hacia los bordes, otras conectan con el centro (donde estará el chip del logo)
    const pathDefs = [
      // TOP-LEFT CORNER
      { d: 'M 0 150 L 250 150 L 350 250 L 350 450 L 500 600', group: 'tl', isMagenta: false },
      { d: 'M 150 0 L 150 200 L 300 350 L 550 350 L 650 450', group: 'tl', isMagenta: true },
      
      // TOP-RIGHT CORNER
      { d: 'M 1920 150 L 1670 150 L 1570 250 L 1570 450 L 1420 600', group: 'tr', isMagenta: false },
      { d: 'M 1770 0 L 1770 200 L 1620 350 L 1370 350 L 1270 450', group: 'tr', isMagenta: true },

      // BOTTOM-LEFT CORNER
      { d: 'M 0 930 L 250 930 L 350 830 L 350 630 L 500 480', group: 'bl', isMagenta: false },
      { d: 'M 150 1080 L 150 880 L 300 730 L 550 730 L 650 630', group: 'bl', isMagenta: true },

      // BOTTOM-RIGHT CORNER
      { d: 'M 1920 930 L 1670 930 L 1570 830 L 1570 630 L 1420 480', group: 'br', isMagenta: false },
      { d: 'M 1770 1080 L 1770 880 L 1620 730 L 1370 730 L 1270 630', group: 'br', isMagenta: true },

      // CENTRAL CHIP CONNECTIONS (se conectan al chip central en 960, 540)
      // El chip estará aprox en x: 880 a 1040, y: 470 a 610
      { d: 'M 500 600 L 650 600 L 750 500 L 880 500', group: 'center', isMagenta: false },
      { d: 'M 1420 600 L 1270 600 L 1170 500 L 1040 500', group: 'center', isMagenta: false },
      { d: 'M 500 480 L 650 480 L 750 580 L 880 580', group: 'center', isMagenta: true },
      { d: 'M 1420 480 L 1270 480 L 1170 580 L 1040 580', group: 'center', isMagenta: true },

      // Líneas decorativas adicionales
      { d: 'M 960 0 L 960 120 L 900 180 L 900 320', group: 'top', isMagenta: false },
      { d: 'M 960 1080 L 960 960 L 1020 900 L 1020 760', group: 'bottom', isMagenta: true }
    ];

    // Nodos asociados a las esquinas o intersecciones finales
    const nodeDefs = [
      { cx: 500, cy: 600, isMagenta: false },
      { cx: 650, cy: 450, isMagenta: true },
      { cx: 1420, cy: 600, isMagenta: false },
      { cx: 1270, cy: 450, isMagenta: true },
      { cx: 500, cy: 480, isMagenta: false },
      { cx: 650, cy: 630, isMagenta: true },
      { cx: 1420, cy: 480, isMagenta: false },
      { cx: 1270, cy: 630, isMagenta: true },
      // Nodos cercanos al chip central
      { cx: 880, cy: 500, isMagenta: false },
      { cx: 1040, cy: 500, isMagenta: false },
      { cx: 880, cy: 580, isMagenta: true },
      { cx: 1040, cy: 580, isMagenta: true },
      // Otros
      { cx: 900, cy: 320, isMagenta: false },
      { cx: 1020, cy: 760, isMagenta: true }
    ];

    // Renderizar caminos en el SVG
    pathDefs.forEach((def, index) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', def.d);
      
      let classes = 'circuit-path';
      if (def.isMagenta && (this.options.theme === 'magenta' || this.options.theme === 'mixed')) {
        classes += ' magenta';
      }
      path.setAttribute('class', classes);
      
      this.svg.appendChild(path);
      this.paths.push({
        element: path,
        group: def.group,
        isMagenta: def.isMagenta
      });
    });

    // Renderizar nodos (círculos) en el SVG
    nodeDefs.forEach((def, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', def.cx);
      circle.setAttribute('cy', def.cy);
      circle.setAttribute('r', '6');
      
      let classes = 'circuit-node';
      if (def.isMagenta && (this.options.theme === 'magenta' || this.options.theme === 'mixed')) {
        classes += ' magenta';
      }
      circle.setAttribute('class', classes);
      
      this.svg.appendChild(circle);
      this.nodes.push({
        element: circle,
        isMagenta: def.isMagenta
      });
    });
  }

  /**
   * Genera la animación de entrada (dibujar circuitos) usando GSAP
   * @param {gsap.Timeline} timeline - Opcional timeline de GSAP para encadenar
   * @param {number} duration - Duración del trazo
   */
  animateDraw(timeline = null, duration = 2.5) {
    const tl = timeline || gsap.timeline();

    // Inicializar paths con strokeDasharray
    this.paths.forEach(pathObj => {
      const el = pathObj.element;
      const length = el.getTotalLength();
      
      // Configurar estado inicial
      el.style.strokeDasharray = length;
      el.style.strokeDashoffset = length;
    });

    // Separar grupos para animar de forma orgánica
    const cornerPaths = this.paths.filter(p => p.group !== 'center');
    const centerPaths = this.paths.filter(p => p.group === 'center');

    // 1. Dibujar líneas de las esquinas hacia el centro
    tl.to(cornerPaths.map(p => p.element), {
      strokeDashoffset: 0,
      duration: duration * 0.6,
      ease: 'power2.out',
      stagger: 0.1
    });

    // 2. Dibujar líneas conectores centrales (empiezan un poco antes de terminar las esquinas)
    tl.to(centerPaths.map(p => p.element), {
      strokeDashoffset: 0,
      duration: duration * 0.4,
      ease: 'power1.inOut',
      stagger: 0.05
    }, `-=${duration * 0.3}`);

    // 3. Aparecer y pulsar nodos dorados
    tl.to(this.nodes.map(n => n.element), {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(2)',
      stagger: 0.02,
      onComplete: () => {
        // Iniciar el pulso en loop una vez aparecen
        this.nodes.forEach(node => {
          node.element.classList.add('pulsing');
        });
      }
    }, '-=0.5');

    return tl;
  }

  /**
   * Configura los circuitos de fondo en un estado estático (ya dibujados)
   */
  setStatic() {
    this.paths.forEach(pathObj => {
      const el = pathObj.element;
      el.style.strokeDasharray = 'none';
      el.style.strokeDashoffset = '0';
    });

    this.nodes.forEach(node => {
      node.element.style.opacity = '1';
      node.element.style.transform = 'scale(1)';
      node.element.classList.add('pulsing');
    });
  }

  /**
   * Hace brillar temporalmente un grupo de caminos simulando el paso de datos
   */
  triggerDataFlow() {
    // Elegir aleatoriamente algunos caminos para hacerlos brillar
    const subset = [...this.paths].sort(() => 0.5 - Math.random()).slice(0, 4);
    subset.forEach(pathObj => {
      const el = pathObj.element;
      el.classList.add('active');
      setTimeout(() => {
        el.classList.remove('active');
      }, 800 + Math.random() * 800);
    });
  }
}
