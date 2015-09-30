class TimbresController < ApplicationController
  before_action :logged_in_user, only: [:new, :create]
  before_action :set_timbre, only: [:edit, :update]
  
  def new
    @timbre = current_user.timbres.build
    #@timbre = current_user.timbres.new
    #@timbres = current_user.timbres.order(created_at: :desc)
  end
  
  def create
    @timbre = current_user.timbres.build(timbre_params)
    if @timbre.save
      flash[:success] = "Timbre created!"
      redirect_to root_path
    else
      render new_timbre_path
    end
  end
  
  def edit
  end
  
  def update
    if @timbre.update(timbre_params)
      redirect_to root_path , message: 'メッセージを編集しました'
    else
      render 'edit'
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
    params.require(:timbre).permit(:name, :json)
  end
  
  def set_timbre
    @timbre = Timbre.find(params[:id])
  end
end
