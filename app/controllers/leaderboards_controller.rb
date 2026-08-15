class LeaderboardsController < ApplicationController
  def index
    @games = Game.active
    # If a specific game is requested, fetch leaderboards for it
    if params[:game_id].present?
      @game = Game.find(params[:game_id])
      @scores = Score.where(game: @game)
                     .includes(:user)
                     .select("DISTINCT ON (user_id) *")
                     .order("user_id, value DESC")
                     .sort_by { |s| -s.value }
    else
      # Global ranking based on highest scores across all games
      @global_scores = Score.select("user_id, SUM(max_value) as total_score")
                            .from(
                              Score.select("user_id, game_id, MAX(value) as max_value").group("user_id, game_id"),
                              :subquery
                            )
                            .group("user_id")
                            .order("total_score DESC")
                            .limit(50)
                            .includes(:user)
    end
  end
end