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
