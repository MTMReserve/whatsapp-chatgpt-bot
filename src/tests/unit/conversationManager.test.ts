import { ConversationManager } from '../../services/conversationManager'
import * as prompts from '../../prompts'

describe('ConversationManager', () => {
  const cm = new ConversationManager()

  it('should return system prompt', () => {
    expect(cm.getSystemPrompt()).toEqual(prompts.sistemaPrompt)
  })

  it('should build perfil prompt', () => {
    const name = 'Maurício'
    const text = cm.getPerfilPrompt(name)
    expect(text).toContain(prompts.perfilClientePrompt)
    expect(text).toContain(name)
  })
})
