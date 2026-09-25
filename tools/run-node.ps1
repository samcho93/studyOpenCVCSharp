# node 스크립트를 UTF-8 로 실행하고 결과를 파일에 기록한 뒤 출력한다 (긴 줄은 잘라서)
param([string]$Script, [string[]]$Args = @(), [int]$TimeoutSec = 120)
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $env:TEMP ("node-" + [guid]::NewGuid().ToString("N").Substring(0, 8) + ".out")
$err = "$out.err"
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "node"
$psi.Arguments = (@($Script) + $Args | ForEach-Object { '"' + $_ + '"' }) -join ' '
$psi.WorkingDirectory = $root
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
$psi.StandardErrorEncoding = [System.Text.Encoding]::UTF8
$p = [System.Diagnostics.Process]::Start($psi)
$so = $p.StandardOutput.ReadToEndAsync()
$se = $p.StandardError.ReadToEndAsync()
if (-not $p.WaitForExit($TimeoutSec * 1000)) { $p.Kill(); Write-Output "TIMEOUT after $TimeoutSec s" }
$text = $so.Result + $(if ($se.Result) { "`n--- stderr ---`n" + $se.Result } else { "" })
[System.IO.File]::WriteAllText($out, $text, [System.Text.UTF8Encoding]::new($false))
$text -split "`n" | ForEach-Object { if ($_.Length -gt 400) { $_.Substring(0, 400) + " …[" + $_.Length + "]" } else { $_ } }
Write-Output "[exit $($p.ExitCode)]"
