import marked from 'marked/lib/marked';

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

  toJson(code: any) {
    let config: any = {};
    const tables = [];
    const lists = [];
    let result = '{';

    const tokens: marked.Token[] = marked.lexer(code);
    for (const token of tokens) {
      switch (token.type) {
        case 'list_start': {
          result += '"children": [';
          break;
        }
        case 'list_item_start': {
          result += '{';
          break;
        }
        case 'text': {
          result += `"name": "${this.escape(token.text)}",`;
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
