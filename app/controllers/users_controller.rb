class UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
    @recent_scores = @user.scores.includes(:game).order(created_at: :desc).limit(10)
    
    # Calculate best scores per game
    @best_scores = @user.scores.includes(:game)
                       .select("DISTINCT ON (game_id) *")
                       .order("game_id, value DESC")

    @favorited_games = @user.favorited_games
    @earned_achievements = @user.user_achievements.includes(:achievement).order(earned_at: :desc)
  end

  def achievements
    @user = User.find(params[:id])
    @earned = @user.user_achievements.includes(:achievement).index_by(&:achievement_id)
    @all_achievements = Achievement.all
  end
end