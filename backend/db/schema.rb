# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.

ActiveRecord::Schema[8.0].define(version: 2026_11_04_000001) do
  create_table "employees", force: :cascade do |t|
    t.string "full_name", null: false
    t.string "email", null: false
    t.string "job_title", null: false
    t.string "department", null: false
    t.string "country", null: false
    t.string "currency", limit: 3, null: false
    t.decimal "salary", precision: 12, scale: 2, null: false
    t.date "hired_on", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["country", "department"], name: "index_employees_on_country_and_department"
    t.index ["country", "job_title"], name: "index_employees_on_country_and_job_title"
    t.index ["email"], name: "index_employees_on_email", unique: true
    t.index ["salary"], name: "index_employees_on_salary"
  end
end
