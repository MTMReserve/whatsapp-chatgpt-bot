// jest.setup.ts
// Este arquivo é carregado automaticamente antes de todos os testes via Jest.

// Variáveis do Twilio
process.env.TWILIO_ACCOUNT_SID = 'AC8d28645fa2304c4eb65a40b4c6d7a591';
process.env.TWILIO_AUTH_TOKEN = '88d0fad7672b43478a916b1c999c74fd';
process.env.TWILIO_WHATSAPP_NUMBER_TO = 'whatsapp:+5512992400142';
process.env.TWILIO_WHATSAPP_NUMBER_FROM = 'whatsapp:+14155238886';

// Variáveis da OpenAI
process.env.OPENAI_KEY = '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';
process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
process.env.OPENAI_TEMPERATURE = '0.7'; // Sempre string no process.env

// Variáveis do Banco de Dados (MariaDB)
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = 'bot_whatsapp';

// Configurações adicionais (se você quiser já deixar preparado para futuramente)
process.env.RATE_LIMIT_POINTS = '10';
process.env.RATE_LIMIT_DURATION = '60';
process.env.HUMANIZER_MIN_DELAY_MS = '300';
process.env.HUMANIZER_MAX_DELAY_MS = '1000';
process.env.LOG_LEVEL = 'info'; // Pode ser 'info', 'warn', 'error', 'debug', etc.
