window.__ModuleLoader__.load({
  id: 'dsh-sidebar-panel-fold',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Locale namespace owned by this plugin. */
    const NS = 'sidebar-panel-fold';
    /** Attribute set on <html> while the panel rows are folded away. */
    const FOLD_ATTRIBUTE = 'data-dsh-sidebar-panel-fold';
    /** Attribute carried by the toggle glyph, so the rule below can keep its row. */
    const MARKER = 'data-dsh-sidebar-panel-fold-toggle';
    /** Storage key for the persisted fold state. */
    const STORAGE_KEY = 'dsh.sidebar.panel-fold.collapsed';
    /** Identifies the injected page style, matching how shipped plugins tag theirs. */
    const STYLE_ID = 'dsh-sidebar-panel-fold/client.css';
    /**
     * Every rendered panel row carries a glyph from this plugin's slot. When the
     * toggle glyph is present in the list, hide the sibling rows that do not
     * carry it; the toggle row itself stays, and so does 新会话 above the list.
     */
    const STYLE_TEXT =
      'html[' + FOLD_ATTRIBUTE + '] nav:has([' + MARKER + ']) > *:not(:has([' + MARKER + '])) {' +
      ' display: none !important;' +
      ' }';

    function readStoredFold() {
      try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
      } catch {
        return false;
      }
    }

    function writeStoredFold(value) {
      try {
        if (value) window.localStorage.setItem(STORAGE_KEY, '1');
        else window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Storage can be unavailable; the fold still works for this page.
      }
    }

    let folded = readStoredFold();
    const listeners = new Set();

    function publishFold() {
      const root = document.documentElement;
      if (folded === true) root.setAttribute(FOLD_ATTRIBUTE, '');
      else root.removeAttribute(FOLD_ATTRIBUTE);
      listeners.forEach((listener) => listener());
    }

    function setFold(value) {
      const next = value === true;
      if (next === folded) return;
      folded = next;
      writeStoredFold(next);
      publishFold();
    }

    /**
     * The sidebar shell wraps every panel glyph in a button whose click selects
     * that panel and throws when the id has no main panel. A capture-phase
     * listener on the document runs before the shell's own handler, so the click
     * that lands on this row's glyph can be consumed here instead.
     */
    function isFoldRow(target) {
      if (target === null || typeof target !== 'object') return false;
      if (typeof target.closest !== 'function') return false;
      const button = target.closest('button');
      if (button === null) return false;
      return button.querySelector('[' + MARKER + ']') !== null;
    }

    function FoldGlyph(props) {
      const size = typeof props.size === 'number' ? props.size : 16;
      const [value, setValue] = React.useState(folded);
      React.useEffect(() => {
        setValue(folded);
        const listener = () => {
          setValue(folded);
        };
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      }, []);
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          'aria-hidden': 'true',
          focusable: 'false',
          [MARKER]: '',
          style: {
            display: 'block',
            color: 'currentColor',
            overflow: 'visible',
            transform: value === true ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 140ms var(--ds-ease-in-out, ease)',
          },
        },
        h('path', {
          d: 'M3.75 6 8 10.25 12.25 6',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    function apply(ctx) {
      const t = ctx.locale.bind(NS);

      ctx.effect(
        () =>
          ctx.locale.register(NS, {
            en: { label: 'Panel list' },
            zh: { label: '插件列表' },
          }),
        'sidebar-panel-fold: dictionary',
      );

      ctx.effect(() => {
        if (document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']') === null) {
          const tag = document.createElement('style');
          tag.dataset.plugin = 'dsh-sidebar-panel-fold';
          tag.dataset.pluginCss = STYLE_ID;
          tag.textContent = STYLE_TEXT;
          document.head.appendChild(tag);
        }
        return () => {
          const tag = document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']');
          if (tag !== null) tag.remove();
        };
      }, 'sidebar-panel-fold: stylesheet');

      ctx.effect(() => {
        publishFold();
        return () => {
          document.documentElement.removeAttribute(FOLD_ATTRIBUTE);
        };
      }, 'sidebar-panel-fold: persisted state');

      ctx.effect(() => {
        const onClick = (event) => {
          if (!isFoldRow(event.target)) return;
          event.preventDefault();
          event.stopPropagation();
          setFold(!folded);
        };
        document.addEventListener('click', onClick, true);
        return () => {
          document.removeEventListener('click', onClick, true);
        };
      }, 'sidebar-panel-fold: toggle click');

      const registerRow = () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: 'sidebar-panel-fold',
            order: -100,
            label: () => t('label'),
          },
          FoldGlyph,
        );

      try {
        ctx.slots.inject('sidebar.panellist', registerRow);
      } catch {
        ctx.effect(() => registerRow(), 'sidebar-panel-fold: row');
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    };
  },
});
