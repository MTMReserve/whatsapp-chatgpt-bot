// src/tests/unit/ngrokUpdater.test.ts

import fs from 'fs/promises';
import path from 'path';
import { updateNgrokEnv } from '../../../src/utils/ngrokUpdater';

jest.mock('fs/promises');

describe('ngrokUpdater', () => {
  const fakeEnvPath = path.resolve(__dirname, '../../../.env');
  const oldContent = `
PORT=3000
TWILIO_WHATSAPP_NUMBER_FROM=+5511999999999
OPENAI_KEY=abc123
`.trim();

  const newNumber = '+5511888888888';

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readFile as jest.Mock).mockResolvedValue(oldContent);
  });

  it('deve atualizar a variável TWILIO_WHATSAPP_NUMBER_FROM no .env', async () => {
    await updateNgrokEnv(newNumber);

    expect(fs.readFile).toHaveBeenCalledWith(fakeEnvPath, 'utf-8');

    const expectedUpdatedEnv = `
PORT=3000
TWILIO_WHATSAPP_NUMBER_FROM=${newNumber}
OPENAI_KEY=abc123
`.trim();

    expect(fs.writeFile).toHaveBeenCalledWith(fakeEnvPath, expectedUpdatedEnv, 'utf-8');
  });

  it('deve adicionar a variável se ela não existir', async () => {
    (fs.readFile as jest.Mock).mockResolvedValue('PORT=3000\nOPENAI_KEY=abc123');

    await updateNgrokEnv(newNumber);

    expect(fs.writeFile).toHaveBeenCalledWith(
      fakeEnvPath,
      `PORT=3000\nOPENAI_KEY=abc123\nTWILIO_WHATSAPP_NUMBER_FROM=${newNumber}`,
      'utf-8'
    );
  });
});
