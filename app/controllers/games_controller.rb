class GamesController < ApplicationController
  def index
    @games = Game.active
    if params[:search].present?
      @games = @games.where("name ILIKE ?", "%#{params[:search]}%")
    end
    if params[:category].present?
      @games = @games.where(category: params[:category])
    end
    @categories = Game.active.select(:category).distinct.pluck(:category)
  end

  def show
    @game = Game.find_by!(slug: params[:slug])
    Game.increment_counter(:plays_count, @game.id)
    @high_score = current_user ? current_user.scores.where(game: @game).maximum(:value) : nil
    @comments = @game.comments.includes(:user).order(created_at: :desc)
    @comment = Comment.new
  end
end