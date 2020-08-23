class CreateTimbres < ActiveRecord::Migration[4.2]
  def change
    create_table :timbres do |t|
      t.references :user, index: true, foreign_key: true
      t.string :name
      t.string :json

      t.timestamps null: false
      
      t.index [:user_id, :created_at]
    end
  end
end
