# Builds the Android APK for AMRsense Snake & Ladder.
# Usage:  powershell -ExecutionPolicy Bypass -File build-apk.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

npx vite build
npx cap sync android

Set-Location android
cmd /c "gradlew.bat assembleDebug --no-daemon > build.log 2>&1"
if ($LASTEXITCODE -ne 0) { Get-Content build.log -Tail 40; throw 'Gradle build failed' }
Set-Location ..

$apk = 'android\app\build\outputs\apk\debug\app-debug.apk'
Copy-Item $apk 'AMRsense-SnakeLadder.apk' -Force
Write-Host "APK ready: $(Resolve-Path 'AMRsense-SnakeLadder.apk')"
