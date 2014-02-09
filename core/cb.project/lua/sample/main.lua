local http = require("http")
local PORT = process.env.PORT or 8080

http.createServer(function (req, res)
  local body = "Hello world\n"
  res:writeHead(200, {
    ["Content-Type"] = "text/plain",
    ["Content-Length"] = #body
  })
  res:finish(body)
end):listen(PORT)

print("Server listening at http://localhost:"..PORT)