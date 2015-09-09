class Timbre < ActiveRecord::Base
  belongs_to :user
  validates :user_id, presence: true
  validates :sound_src, presence: true
end
