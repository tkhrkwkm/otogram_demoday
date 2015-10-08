class FeedbacksController < ApplicationController
  
  before_action :logged_in_user, only: [:index]
  
  def index
    @feedback = Feedback.all().order(created_at: :desc)
  end
  
  def create
    @feedback = Feedback.new()
    @feedback.data = params['feedback']
    if @feedback.save
      render json: @feedback
    end
  end
end
