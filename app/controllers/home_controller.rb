class HomeController < ApplicationController
  def top
    
    if logged_in?
      @timbre = current_user.timbres.new
      @timbres = current_user.timbres.order(created_at: :desc)
    end
    
  end
end
