class CreateAchievements < ActiveRecord::Migration[8.1]
  def change
    create_table :achievements do |t|
      t.string :name
      t.text :description
      t.string :badge_url
      t.integer :points

      t.timestamps
    end
  end
end
