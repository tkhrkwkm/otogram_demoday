class CreateFeedbacks < ActiveRecord::Migration
  def change
    create_table :feedbacks do |t|
      t.text :data

      t.timestamps null: false
    end
  end
end
