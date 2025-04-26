// src/utils/ngrokUpdater.ts

import axios from 'axios';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

export async function updateTwilioWebhook() {
  try {
    // 1. Buscar o endereço do Ngrok local
    const ngrokApiUrl = 'http://127.0.0.1:4040/api/tunnels';
    const response = await axios.get(ngrokApiUrl);
    
    const tunnels = response.data.tunnels;
    const httpsTunnel = tunnels.find((tunnel: any) => tunnel.public_url.startsWith('https'));
    
    if (!httpsTunnel) {
      console.error('❌ Nenhum túnel HTTPS encontrado. Certifique-se que o ngrok está rodando.');
      return;
    }
    
    const publicUrl = httpsTunnel.public_url;
    console.log(`🌐 Ngrok URL detectado: ${publicUrl}`);

    // 2. Atualizar o webhook da Twilio
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.incomingPhoneNumbers
      .list({ phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER.replace('whatsapp:', '') })
      .then(phoneNumbers => {
        if (phoneNumbers.length > 0) {
          const phoneNumberSid = phoneNumbers[0].sid;
          return client.incomingPhoneNumbers(phoneNumberSid)
            .update({
              smsUrl: `${publicUrl}/webhook`, // webhook para mensagens inbound
            });
        } else {
          console.error('❌ Número não encontrado na conta Twilio.');
        }
      });

    console.log('✅ Webhook da Twilio atualizado com sucesso!');

  } catch (error) {
    console.error('❌ Erro atualizando o Webhook:', error);
  }
}
