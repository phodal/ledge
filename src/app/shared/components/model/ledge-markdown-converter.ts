import marked from 'marked';
import { zip } from 'lodash-es';

const LedgeMarkdownConverter = {
  transpose(arr: any[][]) {
    return zip.apply(this, arr);
  },

  buildMarkdownTableJson(code: any) {
    let config: any = {};
    const tables = [];
    const lists = [];
    let result = '{';

    const tokens: marked.Token[] = marked.lexer(code);
    for (const token of tokens) {
      switch (token.type) {
        case 'list_start': {
          result += '"childrens": [';
          break;
        }
        case 'list_item_start': {
          result += '{ "item": ';
          break;
        }
        case 'text': {
          result += `{"name": "${token.text}"}`;
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
        case 'table' : {
          const headers = token.header;
          const cells = this.transpose(token.cells);
          tables.push({
            headers,
            cells
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
        default: {
          console.log(token);
        }
      }
    }

    result = result.replace(/,]/g, ']').replace(/},}/g, '}}');
    result += '}';
    try {
      const list = JSON.parse(result);
      lists.push(list);
    } catch (e) {
      console.log(result);
      console.error(e);
    }

    return {tables, config, lists};
  }
};

export default LedgeMarkdownConverter;
