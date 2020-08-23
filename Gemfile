# frozen_string_literal: true

source "https://rubygems.org"

git_source(:github) {|repo_name| "https://github.com/#{repo_name}" }

ruby '2.5.8'
gem 'rails', '5.2.4.3'
gem 'non-stupid-digest-assets'
gem 'bcrypt', '~> 3.1.7'
gem 'jquery-rails'
gem 'bootstrap-sass'
gem "font-awesome-rails"

group :development do
  gem 'sqlite3'
end

group :production do
  gem 'pg'
end