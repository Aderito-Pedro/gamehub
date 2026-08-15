# Seed Games
games = [
  {
    name: "Pong",
    description: "O clássico jogo de tênis de mesa virtual. Controle sua paleta e rebata a bola para marcar pontos contra o oponente.",
    category: "Arcade",
    how_to_play: "Use as setas para Cima e para Baixo (ou W e S) para mover a paleta esquerda. Rebata a bola e impeça que ela ultrapasse sua defesa."
  },
  {
    name: "Snake",
    description: "Guie a cobra clássica para comer a comida vermelha, crescendo a cada mordida sem bater nas paredes ou na própria cauda.",
    category: "Clássico",
    how_to_play: "Use as setas do teclado (Cima, Baixo, Esquerda, Direita) para guiar a cobra. Coma a comida para ganhar pontos."
  },
  {
    name: "2048",
    description: "Deslize os blocos numerados em uma grade de 4x4. Combine blocos semelhantes para somar seus valores até alcançar o bloco 2048!",
    category: "Puzzle",
    how_to_play: "Use as setas direcionais do teclado (ou deslize na tela) para mover todas as peças. Peças com números iguais se fundem ao colidir."
  },
  {
    name: "Tetris",
    description: "Encaixe os blocos que caem para completar linhas horizontais e fazê-las desaparecer antes que a tela fique cheia.",
    category: "Puzzle",
    how_to_play: "Use as setas esquerda/direita para mover, cima para rotacionar e baixo para queda rápida."
  },
  {
    name: "Flappy Bird",
    description: "Desvie dos canos verdes batendo asas para manter o pássaro voando o máximo de tempo possível.",
    category: "Arcade",
    how_to_play: "Pressione a barra de Espaço ou clique com o mouse para dar um impulso para cima."
  },
  {
    name: "Breakout",
    description: "Destrua todas as fileiras de tijolos na tela rebatendo a bola com a sua plataforma móvel.",
    category: "Arcade",
    how_to_play: "Use o mouse ou as setas esquerda/direita para mover a plataforma."
  },
  {
    name: "Memory",
    description: "Encontre os pares correspondentes de cartas neste jogo clássico de testar e treinar a sua memória.",
    category: "Casual",
    how_to_play: "Clique em uma carta para virá-la e tente encontrar a sua correspondente."
  },
  {
    name: "Maze Chase",
    description: "Guie o seu herói pelo labirinto comendo todos os pontos enquanto foge de três perseguidores implacáveis.",
    category: "Arcade",
    how_to_play: "Use as setas do teclado para mover pelo labirinto. Coma todos os pontos sem deixar que um perseguidor o alcance."
  },
  {
    name: "Speed Racer",
    description: "Desvie do trânsito numa corrida sem fim que fica cada vez mais rápida quanto mais tempo sobreviver.",
    category: "Corrida",
    how_to_play: "Use as setas Esquerda e Direita para mudar de faixa e desviar dos carros que vêm no sentido contrário."
  },
  {
    name: "Platform Hero",
    description: "Salte entre plataformas, esmague inimigos, apanhe moedas e chegue à bandeira no final da fase.",
    category: "Plataforma",
    how_to_play: "Use as setas Esquerda/Direita para mover e Cima (ou Espaço) para saltar. Salte em cima dos inimigos para os derrotar."
  },
  {
    name: "Tank Duel",
    description: "Duelo de artilharia por turnos. Ajuste o ângulo e a potência para acertar no tanque inimigo antes que ele acerte em você.",
    category: "Ação",
    how_to_play: "Use Cima/Baixo para ajustar o ângulo, Esquerda/Direita para ajustar a potência, e Espaço para disparar."
  },
  {
    name: "Bomb Arena",
    description: "Coloque bombas para destruir paredes e inimigos numa arena em grelha, sem se apanhar na própria explosão.",
    category: "Ação",
    how_to_play: "Use as setas para mover e Espaço para colocar uma bomba. Destrua todos os inimigos sem ser apanhado pela explosão."
  },
  {
    name: "Block Smash",
    description: "Uma variante do clássico quebra-blocos com power-ups: plataforma mais larga, multi-bola e bola mais lenta.",
    category: "Arcade",
    how_to_play: "Use o mouse ou as setas Esquerda/Direita para mover a plataforma. Apanhe os power-ups que caem dos blocos destruídos."
  },
  {
    name: "Star Blaster",
    description: "Pilote a sua nave, destrua os asteroides que se aproximam e sobreviva o máximo de tempo possível no espaço.",
    category: "Ação",
    how_to_play: "Use Esquerda/Direita para mover a nave e Espaço para disparar. Destrua os asteroides antes que colidam consigo."
  }
]

games.each do |game_attrs|
  Game.find_or_create_by!(name: game_attrs[:name]) do |game|
    game.description = game_attrs[:description]
    game.category = game_attrs[:category]
    game.how_to_play = game_attrs[:how_to_play]
    game.plays_count = 0
    game.active = true
  end
end

# Seed Achievements
achievements = [
  { name: "Primeiro Passo", description: "Jogue qualquer jogo pela primeira vez.", points: 10, badge_url: "badge_first_step" },
  { name: "Mestre do Pong", description: "Consiga 10 pontos em uma partida de Pong.", points: 30, badge_url: "badge_pong" },
  { name: "Cobra Gigante", description: "Consiga mais de 50 pontos no Snake.", points: 40, badge_url: "badge_snake" },
  { name: "Gênio Matemático", description: "Chegue ao bloco 2048 no jogo 2048.", points: 100, badge_url: "badge_2048" }
]

achievements.each do |ach_attrs|
  Achievement.find_or_create_by!(name: ach_attrs[:name]) do |ach|
    ach.description = ach_attrs[:description]
    ach.points = ach_attrs[:points]
    ach.badge_url = ach_attrs[:badge_url]
  end
end

puts "Database seeded successfully!"
