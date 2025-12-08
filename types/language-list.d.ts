declare module 'language-list' {
  const languageListModule: {
    getLanguage: () => Record<string, string>
    getName: (id: string) => string
  }
  export default languageListModule
}
