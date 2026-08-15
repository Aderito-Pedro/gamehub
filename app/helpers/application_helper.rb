module ApplicationHelper
  GAME_CANVAS_SIZES = {
    "pong" => [560, 360],
    "snake" => [480, 480],
    "2048" => [480, 480],
    "tetris" => [300, 600],
    "flappy-bird" => [380, 560],
    "breakout" => [480, 480],
    "memory" => [480, 480],
    "maze-chase" => [460, 520],
    "speed-racer" => [360, 560],
    "platform-hero" => [640, 360],
    "tank-duel" => [560, 360],
    "bomb-arena" => [480, 480],
    "block-smash" => [480, 480],
    "star-blaster" => [420, 560]
  }.freeze

  def game_canvas_size(game)
    GAME_CANVAS_SIZES.fetch(game.slug, [480, 480])
  end
end
