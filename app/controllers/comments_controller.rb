class CommentsController < ApplicationController
  before_action :authenticate_user!

  def create
    @game = Game.find_by!(slug: params[:game_slug])
    @comment = @game.comments.build(comment_params)
    @comment.user = current_user

    if @comment.save
      redirect_to game_path(@game), notice: "Comentário enviado com sucesso!"
    else
      redirect_to game_path(@game), alert: "Não foi possível salvar o comentário. Certifique-se de preencher o conteúdo e nota de 1 a 5."
    end
  end

  def destroy
    @comment = current_user.comments.find(params[:id])
    @game = @comment.game
    @comment.destroy
    redirect_to game_path(@game), notice: "Comentário excluído."
  end

  private

  def comment_params
    params.require(:comment).permit(:content, :rating)
  end
end