# Uygulama ikonlarını (lacivert zemin, 10 taneli tesbih, ortada onay işareti) PNG olarak üretir.
Add-Type -AssemblyName System.Drawing
$dir = Join-Path $PSScriptRoot 'public\icons'
New-Item -ItemType Directory -Force $dir | Out-Null

function New-Icon([int]$size, [string]$name) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::FromArgb(31, 78, 140))
  $c = $size / 2
  $r = $size * 0.30
  $beadR = $size * 0.052
  $gold = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(227, 182, 92))
  $thread = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(90, 255, 255, 255)), ($size * 0.008)
  $g.DrawEllipse($thread, $c - $r, $c - $r, 2 * $r, 2 * $r)
  for ($i = 0; $i -lt 10; $i++) {
    $a = (-90 + 18 + $i * 36) * [Math]::PI / 180
    $x = $c + $r * [Math]::Cos($a); $y = $c + $r * [Math]::Sin($a)
    $g.FillEllipse($gold, $x - $beadR, $y - $beadR, 2 * $beadR, 2 * $beadR)
  }
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ($size * 0.05)
  $pen.StartCap = 'Round'; $pen.EndCap = 'Round'; $pen.LineJoin = 'Round'
  $pts = @(
    (New-Object System.Drawing.PointF ($c - $size * 0.11), ($c + $size * 0.005)),
    (New-Object System.Drawing.PointF ($c - $size * 0.03), ($c + $size * 0.085)),
    (New-Object System.Drawing.PointF ($c + $size * 0.12), ($c - $size * 0.075))
  )
  $g.DrawLines($pen, $pts)
  $bmp.Save((Join-Path $dir $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-Icon 192 'icon-192.png'
New-Icon 512 'icon-512.png'
New-Icon 180 'apple-touch-icon.png'
Write-Output "ikonlar hazır"
