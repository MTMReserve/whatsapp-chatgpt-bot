import { getAnalyzedProfile } from '../../services/clientProfileRepository';
import { botPersona } from '../../persona/botPersona';

describe('getAnalyzedProfile', () => {
  it('maps botPersona style to perfil cliente', () => {
    const perfil = getAnalyzedProfile('999');
    expect(perfil.formalidade).toBe(botPersona.estiloDeFala.formalidade);
    expect(perfil.emojis).toBe(botPersona.estiloDeFala.emojis);
    const fala = botPersona.estiloDeFala.frasesCurtas ? 'fala pouco' : 'fala muito';
    expect(perfil.fala).toBe(fala);
  });
});
