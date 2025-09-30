import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const options: Monaco.editor.IStandaloneEditorConstructionOptions = {
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 17,
    lineNumbers: 'off',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    minimap: {
        enabled: false
    },
    automaticLayout: true,
    renderLineHighlight: 'none',
    quickSuggestions: false,
    wordWrap: "on",
    scrollbar: {
        vertical: "hidden",
        horizontal: "hidden",
        verticalScrollbarSize: 0,
        horizontalScrollbarSize: 0,
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        arrowSize: 0
    },
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnEnter: "off",
    acceptSuggestionOnCommitCharacter: false,
    // wordBasedSuggestions: false,
    snippetSuggestions: 'none',
    roundedSelection: false,
    tabSize: 2,
    parameterHints: {
        enabled: false
    },
    hover: {
        enabled: false
    },
    renderIndentGuides: false, // legacy setting
    guides: {
        indentation: false        // newer setting
    },
    stickyScroll: {
        enabled: false
    }
  
};