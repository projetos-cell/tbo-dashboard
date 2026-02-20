// TBO OS -- Design System (Phase 8 - Enhancement)
// Centralized design tokens, skeleton loading, module color system,
// micro-interactions, and icon animations.
// Singleton: window.TBO_DESIGN

const TBO_DESIGN = {

  // =====================================================================
  // 1. DESIGN TOKENS
  // =====================================================================
  tokens: {
    spacing: {
      xs:   4,
      sm:   8,
      md:   12,
      lg:   16,
      xl:   24,
      xxl:  32,
      xxxl: 48
    },

    radius: {
      sm:   4,
      md:   8,
      lg:   12,
      xl:   16,
      pill:  999
    },

    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
      md: '0 4px 12px rgba(0, 0, 0, 0.10)',
      lg: '0 8px 30px rgba(0, 0, 0, 0.14)',
      xl: '0 12px 48px rgba(0, 0, 0, 0.20)'
    },

    timing: {
      fast:   '150ms',
      normal: '250ms',
      slow:   '400ms',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },

    typeScale: {
      display: {
        size:          '2rem',
        weight:        800,
        lineHeight:    1.1,
        letterSpacing: '-0.02em'
      },
      heading: {
        size:          '1.5rem',
        weight:        700,
        lineHeight:    1.2,
        letterSpacing: '-0.01em'
      },
      title: {
        size:          '1.1rem',
        weight:        600,
        lineHeight:    1.3,
        letterSpacing: '0'
      },
      body: {
        size:          '0.875rem',
        weight:        400,
        lineHeight:    1.5,
        letterSpacing: '0'
      },
      caption: {
        size:          '0.75rem',
        weight:        500,
        lineHeight:    1.4,
        letterSpacing: '0.01em'
      },
      overline: {
        size:          '0.65rem',
        weight:        700,
        lineHeight:    1.2,
        letterSpacing: '0.08em'
      }
    }
  },


  // =====================================================================
  // 2. SKELETON LOADING COMPONENT
  // =====================================================================

  /**
   * Create a skeleton loading placeholder.
   * @param {'card'|'table'|'kpi'|'list'|'chart'} type
   * @returns {string} HTML string with shimmer animation placeholders
   */
  createSkeleton(type) {
    const skeletons = {
      card: `
        <div class="ds-skeleton-card">
          <div class="skeleton ds-skeleton-card__image"></div>
          <div class="ds-skeleton-card__body">
            <div class="skeleton ds-skeleton-card__title"></div>
            <div class="skeleton ds-skeleton-card__line"></div>
            <div class="skeleton ds-skeleton-card__line ds-skeleton-card__line--short"></div>
          </div>
        </div>`,

      table: `
        <div class="ds-skeleton-table">
          <div class="ds-skeleton-table__header">
            <div class="skeleton ds-skeleton-table__cell ds-skeleton-table__cell--header"></div>
            <div class="skeleton ds-skeleton-table__cell ds-skeleton-table__cell--header"></div>
            <div class="skeleton ds-skeleton-table__cell ds-skeleton-table__cell--header"></div>
            <div class="skeleton ds-skeleton-table__cell ds-skeleton-table__cell--header"></div>
          </div>
          ${Array.from({ length: 5 }, () => `
          <div class="ds-skeleton-table__row">
            <div class="skeleton ds-skeleton-table__cell"></div>
            <div class="skeleton ds-skeleton-table__cell"></div>
            <div class="skeleton ds-skeleton-table__cell"></div>
            <div class="skeleton ds-skeleton-table__cell"></div>
          </div>`).join('')}
        </div>`,

      kpi: `
        <div class="ds-skeleton-kpi">
          <div class="skeleton ds-skeleton-kpi__label"></div>
          <div class="skeleton ds-skeleton-kpi__value"></div>
          <div class="skeleton ds-skeleton-kpi__trend"></div>
        </div>`,

      list: `
        <div class="ds-skeleton-list">
          ${Array.from({ length: 4 }, () => `
          <div class="ds-skeleton-list__item">
            <div class="skeleton ds-skeleton-list__avatar"></div>
            <div class="ds-skeleton-list__text">
              <div class="skeleton ds-skeleton-list__primary"></div>
              <div class="skeleton ds-skeleton-list__secondary"></div>
            </div>
          </div>`).join('')}
        </div>`,

      chart: `
        <div class="ds-skeleton-chart">
          <div class="ds-skeleton-chart__header">
            <div class="skeleton ds-skeleton-chart__title"></div>
            <div class="skeleton ds-skeleton-chart__legend"></div>
          </div>
          <div class="ds-skeleton-chart__area">
            <div class="skeleton ds-skeleton-chart__canvas"></div>
          </div>
        </div>`
    };

    return skeletons[type] || skeletons.card;
  },

  /**
   * Inject skeleton loading into a container element.
   * @param {HTMLElement|string} target - Element or selector
   * @param {'card'|'table'|'kpi'|'list'|'chart'} type
   */
  showSkeleton(target, type) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    el.dataset.skeletonActive = 'true';
    el.innerHTML = this.createSkeleton(type);
  },

  /**
   * Remove skeleton from a container.
   * @param {HTMLElement|string} target
   */
  hideSkeleton(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    delete el.dataset.skeletonActive;
  },


  // =====================================================================
  // 3. MODULE COLOR SYSTEM
  // =====================================================================

  /** @private Map of module names to their accent color */
  _moduleColors: {
    'dashboard': '#E85102',   // brand orange
    'projetos':       '#3b82f6',   // blue
    'financeiro':     '#10b981',   // emerald
    'pessoas':        '#8b5cf6',   // purple
    'rh':             '#8b5cf6',   // purple (alias)
    'comercial':      '#f59e0b',   // amber
    'pipeline':       '#f59e0b',   // amber (alias)
    'mercado':        '#14b8a6',   // teal
    'cultura':        '#ec4899'    // pink
  },

  /**
   * Get the accent color for a module.
   * @param {string} moduleName
   * @returns {string} Hex color string
   */
  getModuleColor(moduleName) {
    const key = (moduleName || '').toLowerCase().trim();
    return this._moduleColors[key] || this._moduleColors['dashboard'];
  },

  /**
   * Apply a module theme to the document by setting CSS custom properties.
   * Sets --module-accent on the closest [data-module-theme] ancestor or on :root.
   * @param {string} moduleName
   * @param {HTMLElement} [scope=document.documentElement] Optional scope element
   */
  applyModuleTheme(moduleName, scope) {
    const color = this.getModuleColor(moduleName);
    const target = scope || document.documentElement;
    target.style.setProperty('--module-accent', color);
    target.setAttribute('data-module-theme', (moduleName || '').toLowerCase().trim());
  },

  /**
   * Remove the module theme from a scope.
   * @param {HTMLElement} [scope=document.documentElement]
   */
  clearModuleTheme(scope) {
    const target = scope || document.documentElement;
    target.style.removeProperty('--module-accent');
    target.removeAttribute('data-module-theme');
  },


  // =====================================================================
  // 4. MICRO-INTERACTIONS
  // =====================================================================

  /**
   * Add press effect (scale down on mousedown, spring back on mouseup).
   * @param {string} selector - CSS selector for target elements
   */
  addPressEffect(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el._pressEffectAttached) return;
      el._pressEffectAttached = true;
      el.classList.add('press-effect');
    });
  },

  /**
   * Add material-style ripple effect on click.
   * @param {string} selector - CSS selector for target elements
   */
  addRippleEffect(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el._rippleEffectAttached) return;
      el._rippleEffectAttached = true;
      el.classList.add('ripple-container');

      el.addEventListener('click', function (e) {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        el.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
          ripple.remove();
        });
      });
    });
  },

  /**
   * Animate a number counting up from 0 to targetValue.
   * @param {HTMLElement|string} element - Element or selector
   * @param {number} targetValue - The final number to display
   * @param {number} [duration=1200] - Animation duration in ms
   * @param {object} [options] - Optional config
   * @param {string} [options.prefix=''] - Text before the number (e.g. 'R$ ')
   * @param {string} [options.suffix=''] - Text after the number (e.g. '%')
   * @param {number} [options.decimals=0] - Decimal places
   * @param {string} [options.locale='pt-BR'] - Number formatting locale
   */
  addCountUpAnimation(element, targetValue, duration = 1200, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;

    const { prefix = '', suffix = '', decimals = 0, locale = 'pt-BR' } = options;
    const startTime = performance.now();
    const startValue = 0;

    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = startValue + (targetValue - startValue) * easedProgress;

      el.textContent = prefix + formatter.format(currentValue) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  },


  // =====================================================================
  // 5. ICON ANIMATIONS
  // =====================================================================

  /**
   * Animate an icon element.
   * @param {HTMLElement|string} element - Icon element or selector
   * @param {'fadeIn'|'bounce'|'pulse'|'spin'} type - Animation type
   */
  animateIcon(element, type) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;

    // Remove any previous icon animation classes
    el.classList.remove('ds-icon-fadeIn', 'ds-icon-bounce', 'ds-icon-pulse', 'ds-icon-spin');

    // Force reflow so re-adding the same class triggers the animation again
    void el.offsetWidth;

    const classMap = {
      fadeIn: 'ds-icon-fadeIn',
      bounce: 'ds-icon-bounce',
      pulse:  'ds-icon-pulse',
      spin:   'ds-icon-spin'
    };

    const cls = classMap[type];
    if (cls) {
      el.classList.add(cls);
    }
  },

  /**
   * Animate all lucide icons within a container after render.
   * @param {HTMLElement|string} container - Container element or selector
   * @param {'fadeIn'|'bounce'|'pulse'|'spin'} type - Animation type
   */
  animateIcons(container, type = 'fadeIn') {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const icons = el.querySelectorAll('[data-lucide], .lucide, svg.lucide');
    icons.forEach((icon, index) => {
      // Stagger each icon slightly
      setTimeout(() => {
        this.animateIcon(icon, type);
      }, index * 50);
    });
  },


  // =====================================================================
  // UTILITY: Apply a type scale to an element
  // =====================================================================

  /**
   * Apply a type scale from tokens to an element.
   * @param {HTMLElement|string} element
   * @param {'display'|'heading'|'title'|'body'|'caption'|'overline'} scale
   */
  applyTypeScale(element, scale) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    const ts = this.tokens.typeScale[scale];
    if (!ts) return;
    el.style.fontSize = ts.size;
    el.style.fontWeight = ts.weight;
    el.style.lineHeight = ts.lineHeight;
    if (ts.letterSpacing && ts.letterSpacing !== '0') {
      el.style.letterSpacing = ts.letterSpacing;
    }
    if (scale === 'overline') {
      el.style.textTransform = 'uppercase';
    }
  },


  // =====================================================================
  // INIT: Auto-bootstrap on DOMContentLoaded
  // =====================================================================
  init() {
    // Add press effects to common interactive elements
    this.addPressEffect('.btn, .card[onclick], .nav-item');

    // Animate lucide icons that are already rendered
    this.animateIcons(document.body, 'fadeIn');

    console.log('[TBO_DESIGN] Design system initialized');
  }
};

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TBO_DESIGN.init());
} else {
  TBO_DESIGN.init();
}

// Export for module systems if available
if (typeof window !== 'undefined') {
  window.TBO_DESIGN = TBO_DESIGN;
}
