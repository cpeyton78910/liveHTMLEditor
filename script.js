const editorElement = document.getElementById('editor');
const preview = document.getElementById('preview-container');
const editorContainer = document.getElementById('editor-container');

const editor = CodeMirror.fromTextArea(editorElement, {
  mode: 'htmlmixed',
  theme: 'default',
  lineNumbers: true,
  tabSize: 2,
  indentWithTabs: false,
  lineWrapping: true,
  extraKeys: {
    'Ctrl-Space': 'autocomplete',
    'Enter': function(cm) {
      const cursor = cm.getCursor();
      const token = cm.getTokenAt(cursor);
      const selfClosingTags = ['br', 'img', 'input', 'hr', 'meta', 'link'];

      if (token.string.match(/^[a-z]+(\.[a-z]+)?(\#[a-z]+)?$/)) {
        const parts = token.string.split(/([.#])/);
        const tag = parts[0];
        let id = '';
        let className = '';

        for (let i = 1; i < parts.length; i += 2) {
          if (parts[i] === '#') {
            id = parts[i + 1];
          } else if (parts[i] === '.') {
            className = parts[i + 1];
          }
        }

        let replacement = `<${tag}`;
        if (id) replacement += ` id="${id}"`;
        if (className) replacement += ` class="${className}"`;
        replacement += selfClosingTags.includes(tag) ? '>' : `></${tag}>`;

        cm.replaceRange(replacement, {line: cursor.line, ch: token.start}, {line: cursor.line, ch: token.end});
        if (!selfClosingTags.includes(tag)) {
          cm.setCursor({line: cursor.line, ch: token.start + replacement.length - tag.length - 3});
        }
      } else {
        cm.execCommand('newlineAndIndent');
      }
    }
  }
});

function updatePreview() {
  const content = editor.getValue();
  preview.srcdoc = content;
}

editor.on('change', updatePreview);
updatePreview();

function openInNewTab() {
  const newWindow = window.open();
  newWindow.document.write(editor.getValue());
  newWindow.document.close();
}

function saveFile() {
  const blob = new Blob([editor.getValue()], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'index.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

function setLayout(layout) {
  switch (layout) {
    case '50-50':
      editorContainer.style.width = '50%';
      preview.style.width = '50%';
      break;
    case '75-25':
      editorContainer.style.width = '75%';
      preview.style.width = '25%';
      break;
    case '25-75':
      editorContainer.style.width = '25%';
      preview.style.width = '75%';
      break;
  }
  editor.refresh();
}