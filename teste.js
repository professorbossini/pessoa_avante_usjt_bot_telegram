const news = {
    '31/10/2021 18h20': '\nAvtcoins pela trilha de perspectivas e questionário do estudante (questionários respondidos até 20/10/2021)\nAvtcoins pelas presenças em aula até o dia 27/10/2021',
    '19/10/2021': '\nAvtcoins pela trilha de perspectivas e questionário do estudante (em andamento)\nAvtcoins pelas presenças em aula até o dia 13/10\nAvtcoins pelos puzzles - trilha de vídeos (atualização finalizada)\nAvtcoins da prova de tópicos gerais cujo prazo final era 13/10 (atualização finalizada)'
  }
  let textoNews = ''
  for (atualizacao in news) {
    textoNews = `${textoNews} ${atualizacao}: ${news[atualizacao]}\n*******\n`
  }
  console.log(textoNews)