$root = $PSScriptRoot
$port = 5500
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host ""
Write-Host "  Barcsay utca 16 - helyi szerver" -ForegroundColor Yellow
Write-Host "  http://localhost:$port/" -ForegroundColor Green
Write-Host "  Leallitas: Ctrl+C" -ForegroundColor DarkGray
Write-Host ""

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = $ctx.Request.Url.LocalPath
  if ($path -eq "/") { $path = "/index.html" }
  $file = Join-Path $root ($path.TrimStart("/"))

  if (Test-Path $file -PathType Leaf) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $mime = switch ($ext) {
      ".html"  { "text/html; charset=utf-8" }
      ".css"   { "text/css" }
      ".js"    { "application/javascript" }
      ".jpg"   { "image/jpeg" }
      ".jpeg"  { "image/jpeg" }
      ".png"   { "image/png" }
      ".webp"  { "image/webp" }
      ".mp4"   { "video/mp4" }
      default  { "application/octet-stream" }
    }
    $ctx.Response.ContentType = $mime
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
    $msg = [Text.Encoding]::UTF8.GetBytes("404")
    $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
  }
  $ctx.Response.Close()
}
