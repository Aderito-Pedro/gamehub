Rails.application.routes.draw do
  devise_for :users, controllers: {
    omniauth_callbacks: "users/omniauth_callbacks",
    registrations: "users/registrations"
  }

  post "guest_login", to: "users/sessions#guest_login", as: :guest_login

  resources :games, param: :slug, only: [:index, :show] do
    resources :scores, only: [:create]
    resources :comments, only: [:create, :destroy]
    resource :favorite, only: [:create, :destroy]
    
    member do
      get :leaderboard
    end
  end

  resources :users, only: [:show] do
    member do
      get :achievements
    end
  end

  get "leaderboard", to: "leaderboards#index", as: :global_leaderboard
  get "facebook", to: "facebook_integrations#index", as: :facebook_integration

  root "games#index"
end
