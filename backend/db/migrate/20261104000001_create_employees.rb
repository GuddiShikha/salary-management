class CreateEmployees < ActiveRecord::Migration[8.0]
  def change
    create_table :employees do |t|
      t.string :full_name, null: false
      t.string :email, null: false
      t.string :job_title, null: false
      t.string :department, null: false
      t.string :country, null: false
      t.string :currency, null: false, limit: 3
      t.decimal :salary, precision: 12, scale: 2, null: false
      t.date :hired_on, null: false

      t.timestamps
    end

    add_index :employees, :email, unique: true
    add_index :employees, :salary
    add_index :employees, %i[country job_title]
    add_index :employees, %i[country department]
  end
end
