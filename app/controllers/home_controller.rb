class HomeController < ApplicationController
  def top
    
    if logged_in?
      redirect_to user_path(current_user)
    end
    
    @timbres = Timbre.all.order(updated_at: :desc)
    
  end
end
