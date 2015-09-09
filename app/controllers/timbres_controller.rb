class TimbresController < ApplicationController
  before_action :logged_in_user, only: [:create]

  def create
    @timbre = current_user.timbres.new(timbre_params)
    if @timbre.save
      flash[:success] = "Timbre created!"
      redirect_to root_path
    else
      render 'home/top'
    end
  end
  
  def destroy
    @timbre = current_user.timbres.find_by(id: params[:id])
    return redirect_to root_url if @timbre.nil?
    @timbre.destroy
    flash[:success] = "Timbre deleted"
    redirect_to request.referrer || root_path
  end
  
  private
  def timbre_params
    params.require(:timbre).permit(:sound_src, :description)
  end
end
