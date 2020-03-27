// tslint:disable-next-line:max-line-length
// REFS: https://github.com/todotxt/todo.txt-android/blob/614e0b5eb688cae8236f33c64d7e791d1030cf3c/app/src/main/java/com/todotxt/todotxttouch/task/TextSplitter.java
import shortid from 'shortid';
import {MarkdownListModel} from './markdown.model';

const COMPLETED_PATTERN = /(\[[x|X]] )(.*)/;
const COMPLETED_PREPENDED_DATES_PATTERN = /(\d{4}-\d{2}-\d{2}) (\d{4}-\d{2}-\d{2}) (.*)/;
const SINGLE_DATE_PATTERN = /(\d{4}-\d{2}-\d{2}) (.*)/;
const ID_PATTERN = /(\s\$([A-Za-z0-9_-]{7,14})) (.*)/;
const CONTEXT_PATTERN = /(?:^|\s)@(\S*\w)/;
const TAG_PATTERN = /(?:^|\s)\+(\S*\w)/g;
const PRIORITY_PATTERN = /\(([A-Z])\) (.*)/;

const MarkdownHelper = {
  todoCompiled(text: any): MarkdownListModel {
    const originText = text;
    let completed = false;
    let startDate;
    let endDate;
    let context;
    let priority;
    let tag;
    let id;

    TAG_PATTERN.lastIndex = 0;

    const idMatch = ID_PATTERN.exec(text);
    if (idMatch && idMatch.length && idMatch.length > 1) {
      id = idMatch[2];
      text = idMatch[3];
    }

    const completeMatch = COMPLETED_PATTERN.exec(text);
    if (completeMatch && completeMatch.length && completeMatch.length > 1) {
      completed = true;
      text = completeMatch[2];
    }

    const priorityMatch = PRIORITY_PATTERN.exec(text);
    if (priorityMatch && priorityMatch.length && priorityMatch.length > 1) {
      priority = priorityMatch[1];
      text = priorityMatch[2];
    }

    const dateMatch = COMPLETED_PREPENDED_DATES_PATTERN.exec(text);
    if (dateMatch && dateMatch.length && dateMatch.length > 2) {
      startDate = dateMatch[1];
      endDate = dateMatch[2];
      text = dateMatch[3];
    } else {
      const singleDateMatch = SINGLE_DATE_PATTERN.exec(text);
      if (singleDateMatch && singleDateMatch.length && singleDateMatch.length >= 2) {
        endDate = singleDateMatch[1];
        text = singleDateMatch[2];
      }
    }

    const contextMatch = CONTEXT_PATTERN.exec(text);
    if (contextMatch && contextMatch.length && contextMatch.length > 1) {
      context = contextMatch[1];
      text = text.replace(CONTEXT_PATTERN, '');
    }

    const tagMatch = TAG_PATTERN.exec(text);
    if (tagMatch && tagMatch.length && tagMatch.length > 1) {
      tag = text.match(TAG_PATTERN).map(t => {
        return t.replace(/(?:^|\s)\+/, '');
      });
      text = text.replace(TAG_PATTERN, '');
    }

    if (!id) {
      id = shortid.generate();
    }

    return {
      originText,
      id,
      completed,
      startDate,
      endDate,
      tag,
      context,
      priority,
      text
    };
  },

  markdownToJSON(tokens: marked.Token[], originTasks) {
    let tasks;
    let result = '{';
    let checkString = '';
    let config = '';

    for (const token of tokens) {
      if (token.type !== 'text') {
        checkString = '';
      }
      switch (token.type) {
        case 'list_start': {
          result += '"childrens": [';
          break;
        }
        case 'list_item_start': {
          result += '{ "item": ';
          if ((token as any).checked) {
            checkString = '[x] ';
          } else {
            checkString = '';
          }
          break;
        }
        case 'text': {
          if (token.text.includes('[x] ') || token.text.includes('[X] ') || token.text.includes('[ ] ')) {
            checkString = '';
          }
          result += JSON.stringify(MarkdownHelper.todoCompiled(checkString + token.text)) + ',';
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
      tasks = JSON.parse(result).childrens;
    } catch (e) {
      tasks = originTasks;
    }

    tasks.config = config;
    return tasks;
  },

  buildRatingValue(item: MarkdownListModel) {
    let text = item.text;
    let value = 3;

    const execArray = /(.*):\s*(\d)/.exec(text);
    if (execArray && execArray.length >= 3) {
      text = execArray[1];
      value = parseInt(execArray[2], 10);

      item.chartText = text;
      item.chartValue = value;
    }

    return item;
  },

  updateTextFromRatingValue(item: MarkdownListModel) {
    const execArray = /(.*)\:\s*(\d)/.exec(item.text);
    if (execArray && execArray.length >= 3) {
      const text = execArray[1];
      item.text = text + ': ' + item.chartValue;
    } else {
      item.text = item.text + ': ' + item.chartValue;
    }

    return item;
  }
};

export default MarkdownHelper;
