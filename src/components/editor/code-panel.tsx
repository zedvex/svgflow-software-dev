import React from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../../store/editor-store';

export function CodePanel() {
  const { svgCode, setSvgCode, settings } = useEditorStore();

  return (
    <div className="h-full w-full bg-slate-800">
      <Editor
        height="100%"
        defaultLanguage="xml"
        value={svgCode}
        onChange={(value) => setSvgCode(value || '')}
        theme={settings.theme === 'light' ? 'vs-light' : 'vs-dark'}
        options={{
          minimap: { enabled: false },
          fontSize: settings.codeFontSize,
          lineNumbers: settings.showLineNumbers ? 'on' : 'off',
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          padding: { top: 16 },
        }}
      />
    </div>
  );
}