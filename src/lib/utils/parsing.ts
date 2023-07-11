import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

export function parseTSDocsText(block: any[]) {
    const text = block.reduce((text, line) => {
        if (line.kind === 'text') {
            return text + line.text;
        } else if (line.kind === 'code' && line.text.length > 24) {
            return text + '<pre><code>' + hljs.highlight(line.text.replace('```ts\n', '').replaceAll('`', ''), {language: 'javascript'}).value + '</code></pre>'
        } else if (line.kind === 'code') {
            return text + '<code class="inline-code">' + line.text.replaceAll('`', '') + '</code>';
        }
    }, '');

    return text
}