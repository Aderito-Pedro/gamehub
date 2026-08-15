class Achievement < ApplicationRecord
  has_many :user_achievements, dependent: :destroy
  has_many :users, through: :user_achievements

  validates :name, presence: true, uniqueness: true
  validates :points, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
