import LedgeMarkdownConverter from './ledge-markdown-converter';

describe('LedgeMarkdownConverter', () => {
  it('should create', () => {
    const code = `
|  Challenge;Skill/Ability   | low | high |
|-|-|-|
| low  |      | boredom |
| high | anxiety | flow |
`;
    const json = LedgeMarkdownConverter.buildMarkdownTableJson(code);
    expect(json.tables.length).toEqual(1);
    expect(json.tables[0].headers.length).toEqual(2);
    expect(json.tables[0].cells.length).toEqual(6);
  });
});
