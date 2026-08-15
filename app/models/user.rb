class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:facebook]

  has_many :scores, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorited_games, through: :favorites, source: :game
  has_many :user_achievements, dependent: :destroy
  has_many :achievements, through: :user_achievements
  has_many :comments, dependent: :destroy

  validates :username, presence: true, uniqueness: true, unless: :guest?

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email || "#{auth.uid}@facebook.com"
      user.password = Devise.friendly_token[0, 20]
      base_name = auth.info.name.presence || "player"
      user.username = base_name.gsub(/\s+/, "").downcase + SecureRandom.hex(3)
      user.avatar_url = auth.info.image
    end
  end

  def display_name
    username.presence || "Guest_#{id}"
  end
end
