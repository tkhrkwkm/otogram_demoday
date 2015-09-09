Rails.application.routes.draw do
  
  root 'home#top'
  
  get 'signup' => 'users#new'
  
  resources :users
end
