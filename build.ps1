# app.html'i PWA kabuğuyla sarıp index.html üretir. app.html'i düzenledikten sonra çalıştır.
$dir = $PSScriptRoot
$app = Get-Content -Raw -Encoding UTF8 (Join-Path $dir 'app.html')
$head = @'
<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
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
[System.IO.File]::WriteAllText((Join-Path $dir 'index.html'), $out, (New-Object System.Text.UTF8Encoding $false))
Write-Output "index.html oluşturuldu"
