class CreateFeedbacks < ActiveRecord::Migration[4.2]
  def change
    create_table :feedbacks do |t|
      t.text :data

      t.timestamps null: false
    end
  end
end
