const { default: axios } = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { Telegraf } = require("telegraf");
const { stringify } = require ('flatted');

const bot = new Telegraf(process.env.TOKEN);

const startMessage = "Sou o bot Avante USJT! Consulte já a sua pontuação. /help para mais detalhes.";
const helpMessage = "I. /avtcoins 'seura' sem as aspas para ver a sua posição.\nII. /top100 para ver o top 100.\nIII. /news para saber as últimas atualizações.";
const settingsMessage = "No settings at the moment";
const sorryMessage = "Desculpe, ainda não sei nada sobre isso.";

bot.start((ctx) => ctx.reply(startMessage));
bot.help((ctx) => ctx.reply(helpMessage));
bot.settings((ctx) => ctx.reply(settingsMessage));

const resolveTop10 = async (ctx, resolve) => {
    try{
        const respostaAxios = await axios.get(`https://ancient-cove-06766.herokuapp.com/top_ones?n=100`)
        // console.log ("Resposta Axios: " + stringify(respostaAxios))
        let texto = '';
        const mapeado = respostaAxios.data.map((e, posicao) =>{
            return `${posicao + 1}\u00B0. ${e.nome.split(' ').slice(0, 2).join(' ')} tem ${e.avtCoins} avtcoins.\n`
            // return `${posicao + 1}\u00B0. ${e.nome} tem ${e.avtCoins} avtcoins.\n`

        })
        mapeado.forEach(e => texto += e)
        const respostaTelegram = await resolve (texto);
        // console.log ("Resposta Telegram: " + stringify(respostaTelegram))
    }
    catch (e){
        console.log(e)
        resolve('Problemas técnicos. Tente novamente mais tarde')
    }
}

const resolveRA = async (ctx, resolve) => {
    try {
      const ra = ctx.message.text.split(' ')[1];
      const respostaAxios = await axios.get(`https://ancient-cove-06766.herokuapp.com/myself_among_others?ra=${ra}`)
    //   console.log ("Resposta Axios: " + stringify(respostaAxios.data))
      const aluno = respostaAxios.data.find(aluno => aluno.ra === ra)
     
      const respostaTelegram = await resolve(`Olá, ${aluno.nome.trim()}. Sua posição é ${aluno.posicao}\u00B0. Você tem ${aluno.avtCoins} avtcoins.`);
    //   console.log ("Resposta Telegram: " + stringify(respostaTelegram))
    } catch (err) {
      console.log(err);
      resolve('RA não encontrado. Consulte o suporte.')
    //   ctx.reply();
    }
  }


// bot.on ('inline_query', async (ctx) => {
//     if (ctx.inlineQuery.query === '/top10'){
//         resolveTop10(ctx, (resposta) => ctx.answerInlineQuery(resposta), ctx.inlineQuery.query)
//     }
//     else{
//         resolveRA(ctx, (resposta) => ctx.answerInlineQuery(resposta), ctx.inlineQuery.query)
//     }
// })




const textoNews = `
  19/10/2021:\nAvtcoins pelo questionário (Leia)\nAvtcoins pelas presenças em aula até o dia 13/10\nAvtcoins pelos puzzles (Iara)\nAvtcoins sobre a prova de tópicos diversos (Bossini)`
bot.command('top100', async (ctx) => resolveTop10 (ctx, (resposta) => ctx.reply(resposta)))
bot.command('avtcoins', async (ctx) => resolveRA (ctx, (resposta) => ctx.reply(resposta)))
bot.command('enade', async (ctx) => ctx.reply ('/enade: Conheça mais sobre a prova aqui: http://enade.inep.gov.br/enade/'))
bot.command('news',  async (ctx) => ctx.reply (textoNews))

// bot.on("text", async (ctx) => {
//     const texto = ctx.message.text
//     if (texto.includes('top10')){
//         resolveTop10 (ctx, (resposta) => ctx.reply(resposta))
//     }
//     else if (texto.includes ('ra')){
//         resolveRA (ctx, (resposta) => ctx.reply(resposta))
//     }
// })


bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
