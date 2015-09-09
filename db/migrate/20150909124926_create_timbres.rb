class CreateTimbres < ActiveRecord::Migration
  def change
    create_table :timbres do |t|
      t.references :user, index: true, foreign_key: true
      t.string :sound_src

      t.timestamps null: false
      
      t.index [:user_id, :created_at]
    end
  end
end
