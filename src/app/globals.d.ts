declare module '*.md';

declare module '*.json' {
  const value: any;
  export default value;
}
