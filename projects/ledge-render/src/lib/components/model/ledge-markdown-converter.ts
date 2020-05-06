import marked from 'marked/lib/marked';

const renderer = new marked.Renderer();
renderer.link = (href, title, text) => {
  const link = marked.Renderer.prototype.link.call(renderer, href, title, text);
  if (/^https:\/\//.test(href) || /^http:\/\//.test(href)) {
    return link.replace('<a', '<a target="_blank"');
  }
  return link;
};

marked.setOptions({
  renderer,
});

const LedgeMarkdownConverter = {
  // marked
  escapeTest: /[&<>"']/,
  escapeReplace: /[&<>"']/g,
  escapeTestNoEncode: /[<>"']|&(?!#?\w+;)/,
  escapeReplaceNoEncode: /[<>"']|&(?!#?\w+;)/g,
  escapeReplacements: {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  },

  transpose(array: any[][]) {
    if (array.length === 0) {
      return;
    }

    return array[0].map((col, i) => array.map(row => row[i]));
  },

  getEscapeReplacement(ch) {
    return this.escapeReplacements[ch];
  },

  escape(html: string, encode: boolean) {
    if (encode) {
      if (this.escapeTest.test(html)) {
        return html.replace(
          this.escapeReplace,
          this.getEscapeReplacement.bind(this)
        );
      }
    } else {
      if (this.escapeTestNoEncode.test(html)) {
        return html.replace(
          this.escapeReplaceNoEncode,
          this.getEscapeReplacement.bind(this)
        );
      }
    }

    return html;
  },

  unescaped: (text: string) => text
    .replace('&amp;', '&')
    .replace('&gt;', '>')
    .replace('&lt;', '<')
    .replace('&quot;', '"')
    .replace('&#39;', '\''),

  toJson(code: any) {
    let config: any = {};
    const tables = [];
    const lists = [];
    let result = '{';

    const tokens: marked.Token[] | any = marked.lexer(code);
    for (const token of tokens) {
      switch (token.type) {
        case 'list_start': {
          result += '"children": [';
          break;
        }
        case 'list_item_start': {
          result += '{';
          if (token.task) {
            result += `"checked": ${token.checked}, `;
          }
          break;
        }
        case 'text': {
          let text = marked.inlineLexer(token.text, tokens.links);
          text = this.unescaped(text);

          result += `"name": ${JSON.stringify(text)},`;
          break;
        }
        case 'list_item_end': {
          result += '},';
          break;
        }
        case 'list_end': {
          result += ']';
          break;
        }
        case 'table': {
          const cells = this.transpose(token.cells);
          tables.push({
            header: token.header,
            cells,
          });
          break;
        }
        case 'paragraph': {
          if (token.text.startsWith('config:')) {
            const configText = token.text.split('config:')[1];
            config = JSON.parse(configText);
          }
          break;
        }
        case 'space':
          break;
        default: {
          console.log(token);
        }
      }
    }

    result = result
      .replace(/,]/g, ']')
      .replace(/,}/g, '}')
      .replace(/},}/g, '}}');

    result += '}';
    try {
      const list = JSON.parse(result);
      lists.push(list);
    } catch (e) {
      console.log(result);
      console.error(e);
    }

    return { tables, config, lists };
  },
};

export default LedgeMarkdownConverter;
