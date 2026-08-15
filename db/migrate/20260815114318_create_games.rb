class CreateGames < ActiveRecord::Migration[8.1]
  def change
    create_table :games do |t|
      t.string :name
      t.string :slug
      t.text :description
      t.string :category
      t.text :how_to_play
      t.integer :plays_count, default: 0
      t.boolean :active, default: true

      t.timestamps
    end
    add_index :games, :slug, unique: true
  end
end
