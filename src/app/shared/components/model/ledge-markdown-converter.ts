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

    const tokens: marked.Token[] = marked.lexer(code);
    for (const token of tokens) {
      switch (token.type) {
        case 'list_start': {
          break;
        }
        case 'list_item_start': {
          break;
        }
        case 'list_item_end': {
          break;
        }
        case 'list_end': {
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
    return {tables, config};
  }
};

export default LedgeMarkdownConverter;
