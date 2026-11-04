Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :employees, only: %i[index show create update destroy]
      get "meta", to: "meta#show"
      get "insights/overview", to: "insights#overview"
      get "insights/country", to: "insights#country"
    end
  end
end
