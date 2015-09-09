class HomeController < ApplicationController
  def top
    @timbre = current_user.timbres.new if logged_in?
  end
end
