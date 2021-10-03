const { default: axios } = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { Telegraf, Markup } = require("telegraf");
const { stringify } = require ('flatted')

const bot = new Telegraf(process.env.TOKEN);

const startMessage = "Sou o bot Avante USJT! Consulte já a sua pontuação. /help para mais detalhes";
const helpMessage = "Digite seu ra para ver sua posição. Digite /top10 para ver os 10 primeiros";
const settingsMessage = "No settings at the moment";
const sorryMessage = "Desculpe, ainda não sei nada sobre isso.";

bot.start((ctx) => ctx.reply(startMessage));
bot.help((ctx) => ctx.reply(helpMessage));
bot.settings((ctx) => ctx.reply(settingsMessage));


bot.command('top10', async (ctx) => {
    try{
        const respostaAxios = await axios.get(`https://ancient-cove-06766.herokuapp.com/top_ones`)
        console.log ("Resposta Axios: " + stringify(respostaAxios))
        let texto = '';
        const mapeado = respostaAxios.data.map((e, posicao) =>{
            return `${posicao + 1}\u00B0||${e.nome}\n`
        })
        mapeado.forEach(e => texto += e)
        const respostaTelegram = await ctx.reply(texto);
        console.log ("Resposta Telegram: " + stringify(respostaTelegram))
    }
    catch (e){
        console.log(e)
        ctx.reply('Problemas técnicos. Tente novamente mais tarde')
    }
})
bot.on("text", async (ctx) => {
  try {
    const ra = ctx.message.text;
    const respostaAxios = await axios.get(`https://ancient-cove-06766.herokuapp.com/myself_among_others?ra=${ra}`)
    console.log ("Resposta Axios: " + stringify(respostaAxios.data))
    const aluno = respostaAxios.data.find(aluno => aluno.ra === ra)
   
    const respostaTelegram = await ctx.reply(`Olá, ${aluno.nome.trim()}. Sua posição é ${aluno.posicao}\u00B0. Você tem ${aluno.avtCoins} avtcoins.`);
    console.log ("Resposta Telegram: " + stringify(respostaTelegram))
  } catch (err) {
    console.log(err);
    ctx.reply('RA não encontrado. Consulte o suporte.');
  }
});


bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
