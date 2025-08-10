// src/lib/syntaxHighlighter.ts

/**
 * This utility configures a lightweight instance of highlight.js to prevent
 * the entire library (with all 180+ languages) from being bundled.
 *
 * We import the core library and then register only the languages we
 * anticipate using in blog posts. This significantly reduces the bundle size.
 */

import hljs from 'highlight.js/lib/core';

// Import only the languages you need.
// See the full list in 'node_modules/highlight.js/lib/languages/'
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml'; // For HTML
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash'; // For shell commands

// Register the imported languages with the hljs core.
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml); // 'xml' is the alias for HTML
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);

// Export the configured instance for use with rehype-highlight.
export default hljs;