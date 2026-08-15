class ScoresController < ApplicationController
  before_action :authenticate_user!

  def create
    @game = Game.find_by!(slug: params[:game_slug])
    @score = current_user.scores.build(
      game: @game,
      value: params[:value],
      details: params[:details]
    )

    if @score.save
      check_achievements(current_user, @game, @score.value)
      render json: { success: true, message: "Pontuação salva com sucesso!", high_score: current_user.scores.where(game: @game).maximum(:value) }, status: :created
    else
      render json: { success: false, errors: @score.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def check_achievements(user, game, value)
    # Award "First Step" achievement
    first_step = Achievement.find_by(name: "Primeiro Passo")
    if first_step && !user.achievements.include?(first_step)
      UserAchievement.create(user: user, achievement: first_step)
    end

    # Game specific achievements
    case game.name.downcase
    when "pong"
      pong_ach = Achievement.find_by(name: "Mestre do Pong")
      if pong_ach && value >= 10 && !user.achievements.include?(pong_ach)
        UserAchievement.create(user: user, achievement: pong_ach)
      end
    when "snake"
      snake_ach = Achievement.find_by(name: "Cobra Gigante")
      if snake_ach && value >= 50 && !user.achievements.include?(snake_ach)
        UserAchievement.create(user: user, achievement: snake_ach)
      end
    when "2048"
      m2048_ach = Achievement.find_by(name: "Gênio Matemático")
      if m2048_ach && value >= 2048 && !user.achievements.include?(m2048_ach)
        UserAchievement.create(user: user, achievement: m2048_ach)
      end
    end
  end
end