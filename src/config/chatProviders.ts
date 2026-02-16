// Mapping of chat provider keys to default URLs.
// These defaults can be changed later or exposed in a settings UI.
export const chatProviderUrls: Record<'ChatGPT'|'Claude'|'Gemini'|'Grok', string> = {
  ChatGPT: 'https://chat.openai.com/',
  Claude: 'https://claude.ai/',
  Gemini: 'https://gemini.google.com/',
  Grok: 'https://grok.com'
};

export type ChatProvider = keyof typeof chatProviderUrls;
