class Game < ApplicationRecord
  has_many :scores, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorited_by, through: :favorites, source: :user
  has_many :comments, dependent: :destroy

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, on: :create

  scope :active, -> { where(active: true) }

  def to_param
    slug
  end

  private

  def generate_slug
    self.slug ||= name.parameterize if name.present?
  end
end
