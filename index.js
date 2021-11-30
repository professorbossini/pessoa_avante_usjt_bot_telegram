const { default: axios } = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { Telegraf } = require("telegraf");
const { stringify } = require ('flatted');

const bot = new Telegraf(process.env.TOKEN);
const {BACKEND_URL, PORTA, PROTOCOLO} = process.env
const URL_FINAL = `${PROTOCOLO ? PROTOCOLO + "://": ''}${BACKEND_URL}${PORTA ? ':' + PORTA : ''}`
console.log(URL_FINAL)

const startMessage = "Sou o bot Avante USJT! Consulte já a sua pontuação. /help para mais detalhes.";
const helpMessage = "I. /avtcoins 'seura' sem as aspas para ver a sua posição.\nII. /top100 para ver o top 100.\nIII. /news para saber as últimas atualizações.\nIV. /historico 'seura' para ver as formas como obteve seus avtcoins.\n";
const settingsMessage = "No settings at the moment";
const sorryMessage = "Desculpe, ainda não sei nada sobre isso.";

bot.start((ctx) => ctx.reply(startMessage));
bot.help((ctx) => ctx.reply(helpMessage));
bot.settings((ctx) => ctx.reply(settingsMessage));

const resolveTop10 = async (ctx, resolve) => {
    try{
        const respostaAxios = await axios.get(`${URL_FINAL}/top_ones?n=100`)
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
      const respostaAxios = await axios.get(`${URL_FINAL}/myself_among_others?ra=${ra}`)
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
  const resolveMeuEnade = async (ctx, resolve) => {
    try{
      const respostaAxios = await axios.get(`${URL_FINAL}/resultados_enade`)
      const ra = ctx.message.text.split(' ')[1]
      const aluno = respostaAxios.data.find (a => a.ra === ra)
      if (!ra || !aluno){
        resolve ("RA não encontrado. Você entregou o caderno de questões?")
        return
      }
      const nome = aluno.nome
      const campus = aluno.campus
      const curso = aluno.curso
      const percentual = (aluno.percentual * 100).toPrecision(2)
      const totalAcertos = aluno.totalAcertos
      let resposta = `Olá, ${nome}. Você faz ${curso} no campus ${campus}, certo? `
      resposta = resposta.concat(`Você acertou ${totalAcertos} questões, ou seja, ${percentual}% da prova. `)
      resposta = resposta.concat ("Veja as suas respostas comparadas com o gabarito. ")
      resposta = resposta.concat ("Se a sua resposta for 'R', isso quer dizer que ela estava rasurada, que você não a marcou no caderno etc.\n")
      resposta = resposta.concat ("Q | Sua resposta | Gabarito | Acerto/Erro\n")
      aluno['mapa_questoes_respostas'].forEach(q => {
        resposta = resposta.concat (`Q${q.questao} | ${q.respostaAluno} | ${q.gabarito} | ${q.respostaAluno === q.gabarito ? '✅': '❌'}`)
        resposta = resposta.concat ("\n*********\n")
      })
      resolve(resposta)
    }
    catch(e){
      console.log ("resolveMeuEnade", e)
      resolve('Erro. Consulte o suporte.')

    }
  }

  const resultadoGeralEnade = async (ctx, resolve) => {
    try{
      const respostaAxios = await axios.get(`${URL_FINAL}/resultados_enade`)
      let resposta = ""
      let posicao = 1
      respostaAxios.data.forEach (a => {
        resposta = resposta.concat (`${posicao++}. ${a.nome} [${(a.percentual * 100).toPrecision(2)}%][${a.curso}][${a.campus}]`)
        resposta = resposta.concat ('\n*********\n')
      })
      resolve(resposta)
    }
    catch(e){
      console.log ("resolveMeuEnade", e)
      resolve('Erro. Consulte o suporte.')
    }
  }

  

  const resolveHistorico = async (ctx, resolve) => {
    try {
      const ra = ctx.message.text.split(' ')[1];
      const respostaAxios = await axios.get(`${URL_FINAL}/myself_among_others?ra=${ra}`)
    //   console.log ("Resposta Axios: " + stringify(respostaAxios.data))
      const aluno = respostaAxios.data.find(aluno => aluno.ra === ra)
      const historico = Object.entries(aluno.historico).reduce((res, atual) => {
        const [key, value] = atual;
        return res + `${key}: ${value}\n*********\n`
      }, '')
      const respostaTelegram = await resolve(historico);
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


const news = {
  '19/10/2021': '\nAvtcoins pela trilha de perspectivas e questionário do estudante (em andamento)\nAvtcoins pelas presenças em aula até o dia 13/10\nAvtcoins pelos puzzles - trilha de vídeos (atualização finalizada)\nAvtcoins da prova de tópicos gerais cujo prazo final era 13/10 (atualização finalizada)',
  '31/10/2021 18h20': '\nAvtcoins pela trilha de perspectivas e questionário do estudante (questionários respondidos até 20/10/2021)\nAvtcoins pelas presenças em aula até o dia 27/10/2021',
  '01/11/2021 16h05': '\nAvtcoins pela entrega do vídeo sobre o Avante! (atualização finalizada)',
  '06/11/2021 22h52': "\nUse o comando /historico 'seura' para visualizar as formas como obteve seus avtcoins",
  '14/11/2021 00h56': '\nAvtcoins pelas presenças em aula até o dia 10/11/2021\nLista de datas de presença ordenada\nComando /help atualizado',
  '17/11/2021 19h48': '\nAvtcoins pelas entregas dos alvos do Blackboard. Inclui 50 avtcoins extras pelo Alvo 7. Ainda não inclui 20 avtcoins extras pelos 12 pontos no simulado',
  '17/11/2021 23h17': '\nAvtcoins pela entrega do simulado ENADE, valendo para os que conseguiram 12+ pontos no simulado',
  '18/11/2021 14h10': '\nAvtcoins provenientes do Tópico Desafios - Obtenha AVANTE COINS no Classroom: cálculo finalizado',
  '27/11/2021 13h50': '\nAvtcoins pela entrega do caderno de prova ENADE adicionados',
  '30/11/2021 10h41': "\nAlunos que entregaram o caderno de questões no dia da prova podem consultar o seu desempenho com o comando /meuEnade 'ra'",
  '30/11/2021 11h34': "\nAvtcoins pelas presenças em aula até o dia 24/11/2021. A partir do dia 01/12/2021, haverá um formulário de recursos para que todos possam submeter questionamentos para análise. Aguarde.",

}
let textoNews = ''
for (atualizacao in news) {
  textoNews = `${textoNews} ${atualizacao}: ${news[atualizacao]}\n*******\n`
}
bot.command('top100', async (ctx) => resolveTop10 (ctx, (resposta) => ctx.reply(resposta)))
bot.command('avtcoins', async (ctx) => resolveRA (ctx, (resposta) => ctx.reply(resposta)))
bot.command('enade', async (ctx) => ctx.reply ('/enade: Conheça mais sobre a prova aqui: http://enade.inep.gov.br/enade/'))
bot.command('news',  async (ctx) => ctx.reply (textoNews))
bot.command('historico', async (ctx) => resolveHistorico (ctx, (resposta) => ctx.reply(resposta)))
bot.command('meuEnade', async (ctx) => resolveMeuEnade (ctx, (resposta) => ctx.reply(resposta)))
bot.command('resultadoGeralEnade', async (ctx) => resultadoGeralEnade (ctx, (resposta) => ctx.reply(resposta)))

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
