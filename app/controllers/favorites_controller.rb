class FavoritesController < ApplicationController
  before_action :authenticate_user!

  def create
    @game = Game.find_by!(slug: params[:game_slug])
    current_user.favorites.find_or_create_by!(game: @game)
    redirect_to game_path(@game), notice: "Adicionado aos favoritos!"
  end

  def destroy
    @game = Game.find_by!(slug: params[:game_slug])
    favorite = current_user.favorites.find_by(game: @game)
    favorite&.destroy
    redirect_to game_path(@game), notice: "Removido dos favoritos."
  end
end