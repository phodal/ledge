import LedgeMarkdownConverter from './ledge-markdown-converter';

describe('LedgeMarkdownConverter', () => {
  it('should identify table', () => {
    const code = `
|  Challenge;Skill/Ability   | low | high |
|-|-|-|
| low  |      | boredom |
| high | anxiety | flow |
`;
    const json = LedgeMarkdownConverter.toJson(code);
    expect(json.tables.length).toEqual(1);
    expect(json.tables[0].header.length).toEqual(3);
    expect(json.tables[0].cells.length).toEqual(3);
    expect(json.tables[0].cells[0].length).toEqual(2);
  });

  it('should get config', () => {
    const code = `

config: {"type": "line-model"}
`;
    const json = LedgeMarkdownConverter.toJson(code);
    expect(json.config.type).toEqual('line-model');
  });

  it('should build list', () => {
    const code = `
 - a
 - b
 - c
`;
    const json = LedgeMarkdownConverter.toJson(code);
    expect(json.lists.length).toEqual(1);
    expect(json.lists[0].children.length).toEqual(3);
  });

  it('should build list with children', () => {
    const code = `
 - a
   - b
`;
    const json = LedgeMarkdownConverter.toJson(code);
    expect(json.lists.length).toEqual(1);
    expect(json.lists[0].children[0].children.length).toEqual(1);
  });

  it('should success build for pie chart', () => {
    const code = `pie
 - Some & < > " title
   - a: 4
   - b: 12
   - c: 21
   - d: 19
`;
    const json = LedgeMarkdownConverter.toJson(code);
    expect(json.lists.length).toEqual(1);
    console.log(JSON.stringify(json.lists));
  });
});
