# Dev helper: optional tap, wait, then save an emulator screenshot.
param([string]$name, [int]$x = -1, [int]$y = -1, [int]$wait = 4)
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if ($x -ge 0) { & $adb shell input tap $x $y }
Start-Sleep $wait
cmd /c "`"$adb`" shell screencap -p /sdcard/s.png >nul 2>&1 && `"$adb`" pull /sdcard/s.png `"$PSScriptRoot\$name.png`" >nul 2>&1"
Test-Path "$PSScriptRoot\$name.png"
