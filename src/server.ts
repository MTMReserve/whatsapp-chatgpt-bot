**Arquivo**: `src/server.ts`
```ts
// Carrega variáveis de ambiente antes de qualquer outra coisa
import 'dotenv/config';

// Valida variáveis de ambiente (lança erro se faltar algo)
import { env } from './config/env';

import { app } from './app';

// Porta de execução (padrão 3000 se não informada)
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```