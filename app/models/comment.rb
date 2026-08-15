class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :game

  validates :content, presence: true, length: { minimum: 3, maximum: 500 }
  validates :rating, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }
end
