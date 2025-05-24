// ===============================
// File: src/utils/logger.ts
// ===============================

import winston from 'winston';

// Define os níveis de log e cores
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
  },
};

// Configura o formato dos logs
const logFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...rest } = info;
    const extra = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';
    return `[${timestamp}] ${level}: ${message} ${extra}`;
  })
);

// Cria a instância do logger
export const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'info', // <-- Aqui usamos process.env diretamente!
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
});

// Ativa as cores
winston.addColors(customLevels.colors);
