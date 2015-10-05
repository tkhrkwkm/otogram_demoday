class UsersController < ApplicationController
  
  before_action :logged_in_user, only: [:edit, :update]
  
  def show
   @user = User.find(params[:id])
   @timbre = @user.timbres.new
   @timbres = @user.timbres.order(updated_at: :desc)
  end
  
  def new
    @user = User.new
  end
  
  def create
    @user = User.new(user_params)
    if @user.save
      flash[:success] = 'Welcome to the Otogram!!'
      session[:user_id] = @user.id
      redirect_to root_path
    else
      render 'new'
    end
  end
  
  def edit
    @user = User.find(params[:id])
    if current_user != User.find(params[:id])
      redirect_to user_path(current_user)
    end
  end
  
  def update
    @user = User.find(params[:id])
    if @user.update(user_params)
      flash[:success] = "プロフィールを編集しました。"
      redirect_to user_path(@user)
    else
      render 'edit'
    end
  end

  def following
    @user = User.find(params[:id])
    @timbre = @user.timbres.new
  end
  
  def followers
    @user = User.find(params[:id])
    @timbre = @user.timbres.new
  end

  private
  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end
  
end
