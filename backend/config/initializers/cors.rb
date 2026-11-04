# The React app is served from a different origin (Vite dev server / static host).
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*ENV.fetch("CORS_ORIGINS", "http://localhost:5173").split(","))
    resource "/api/*", headers: :any, methods: %i[get post patch put delete options head]
  end
end
