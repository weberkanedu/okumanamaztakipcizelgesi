# app.html'i PWA kabuğuyla sarıp public/index.html üretir. app.html'i düzenledikten sonra çalıştır.
# Sunucu sadece public/ klasörünü yayınlar; Google Fonts bağlantısı yerel yazı tipleriyle değiştirilir.
$dir = $PSScriptRoot
$app = Get-Content -Raw -Encoding UTF8 (Join-Path $dir 'app.html')
$fontStart = $app.IndexOf('<link rel="preconnect" href="https://fonts.googleapis.com">')
$fontEnd = $app.IndexOf('display=swap">')
if ($fontStart -lt 0 -or $fontEnd -lt 0) { throw "Google Fonts bağlantısı bulunamadı" }
$fontEnd += 'display=swap">'.Length
$app = $app.Substring(0, $fontStart) + '<link rel="stylesheet" href="fonts/fonts.css">' + $app.Substring($fontEnd)
$head = @'
<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.aladhan.com https://api.bigdatacloud.net; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="no-referrer">
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#EDF1F6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0B1422" media="(prefers-color-scheme: dark)">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Kaza Takip">
<style>
  :root { color-scheme: light; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
  body { margin: 0; }
  img { max-width: 100%; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
'@
$out = $head + $app + "`n</body>`n</html>`n"
[System.IO.File]::WriteAllText((Join-Path $dir 'public\index.html'), $out, (New-Object System.Text.UTF8Encoding $false))
Write-Output "public/index.html oluşturuldu"
