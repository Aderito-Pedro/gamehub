class Score < ApplicationRecord
  belongs_to :user
  belongs_to :game

  validates :value, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :top_scores_for_game, ->(game_id) {
    where(game_id: game_id)
      .select("DISTINCT ON (user_id) *")
      .order("user_id, value DESC")
  }
end
