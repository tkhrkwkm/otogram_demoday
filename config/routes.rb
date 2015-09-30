Rails.application.routes.draw do

  root 'home#top'
  
  get    'signup' => 'users#new'
  get    'login'  => 'sessions#new'
  post   'login'  => 'sessions#create'
  delete 'logout' => 'sessions#destroy'
  
  resources :users, only: [:show, :new, :create, :edit, :update, :destroy]
  #resources :sessions, only: [:new, :create, :destroy]
  resources :timbres
  resources :relationships, only: [:create, :destroy]
  
  get '/users/:id/following'=> 'users#following', as: 'following'
  get '/users/:id/followers'=> 'users#followers', as: 'followers'
  
  #[:index,:show,:new,:create,:edit,:update,:destroy]
end
