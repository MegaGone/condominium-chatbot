import "dotenv/config";
import bot from "@bot-whatsapp/bot";
import QRPortalWeb from "@bot-whatsapp/portal";
import BaileysProvider from "@bot-whatsapp/provider/baileys";
import MockAdapter from "@bot-whatsapp/database/mock";

import GoogleSheetService from "./services/sheets/index.js";
import { GOOGLE_SHEET_ID } from "./config.js";

const googelSheet = new GoogleSheetService(
  GOOGLE_SHEET_ID
);

const flowPrincipal = bot
  .addKeyword(["hola", "hi", "dia", "buen dia", "Quiero hablar", "buena tarde", "buena noche", "Buenas", "que tal"])
  .addAnswer([
    `Hola, este es un proceso automatizado`, ,
    `Para iniciar con el chat`,
    `Escribe *Ayuda*`,
  ]);

const flowEmpty = bot
  .addKeyword(bot.EVENTS.ACTION)
  .addAnswer("No te he entendido!", null, async (_, { gotoFlow }) => {
    return gotoFlow(flowMenu);
  });

const flowPedido = bot
  .addKeyword(["ayuda", "Ayuda"], { sensitive: true })
  .addAnswer(
    "¿Cual es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      state.update({ name: ctx.body });
    }
  )
  .addAnswer(
    "¿Cuál es tu número de teléfono?",
    { capture: true },
    async (ctx, { state }) => {
      state.update({ phone: ctx.body });
    }
  )
  .addAnswer(
    "¿Cuál es el número de casa?",
    { capture: true },
    async (ctx, { state }) => {
      state.update({ house: ctx.body });
    }
  )
  .addAnswer(
    "Describe el inconveniente con el cúal necesitas ayuda:",
    { capture: true },
    async (ctx, { state }) => {
      state.update({ obs: ctx.body });
    }
  )
  .addAnswer(
    `Perfecto! Pronto nos estaremos contactando contigo. Puedes obtener más información
    ingresando al siguiente link:
    ${CONSOLE_URL}
    `,
    null,
    async (ctx, { state }) => {
      const currentState = state.getMyState();
      await googelSheet.saveOrder({
        fecha: new Date().toDateString(),
        nombre: currentState.name,
        telefono: currentState.phone,
        casa: currentState.house,
        obs: currentState.obs
      });
    }
  );

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = bot.createFlow([
    flowPrincipal,
    flowPedido,
    flowEmpty,
  ]);
  const adapterProvider = bot.createProvider(BaileysProvider);

  bot.createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
