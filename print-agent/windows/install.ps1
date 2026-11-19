$ErrorActionPreference = "Stop"

$TaskName = "Pedidos360PrintAgent"
$InstallDir = Join-Path $env:ProgramFiles "Pedidos360\PrintAgent"
$ConfigDir = Join-Path $env:ProgramData "Pedidos360"
$SourceDir = Split-Path $PSScriptRoot -Parent

$principal = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent()
)

if (-not $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)) {
    throw "Ejecuta este instalador como administrador."
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$NodeExe = if ($nodeCommand) { $nodeCommand.Source } else { $null }

if (-not $NodeExe) {
    $nodeVersion = "24.22.3"
    $architecture = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") {
        "arm64"
    } else {
        "x64"
    }

    $msiName = "node-v$nodeVersion-$architecture.msi"
    $msiUrl = "https://nodejs.org/dist/v$nodeVersion/$msiName"
    $msiPath = Join-Path $env:TEMP $msiName

    Write-Host "Descargando Node.js $nodeVersion para Windows $architecture..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath

    Write-Host "Instalando Node.js..."
    $install = Start-Process msiexec.exe `
        -ArgumentList "/i `"$msiPath`" /qn /norestart" `
        -Wait -PassThru

    if ($install.ExitCode -notin @(0, 3010)) {
        throw "Falló la instalación de Node.js. Código: $($install.ExitCode)"
    }

    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($nodeCommand) {
        $NodeExe = $nodeCommand.Source
    } else {
        $NodeExe = Join-Path $env:ProgramFiles "nodejs\node.exe"
    }

    if (-not (Test-Path $NodeExe)) {
        throw "Node.js se instaló, pero no se encontró node.exe."
    }

    Remove-Item $msiPath -Force -ErrorAction SilentlyContinue
}

$NpmCmd = Join-Path (Split-Path $NodeExe -Parent) "npm.cmd"
if (-not (Test-Path $NpmCmd)) {
    throw "No se encontró npm.cmd junto a Node.js: $NpmCmd"
}

if (-not (Test-Path (Join-Path $SourceDir "dist\index.js"))) {
    throw "No se encontró dist\index.js. Primero debes compilar el agente."
}

Write-Host "Instalando Pedidos360 Print Agent..."

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null

Copy-Item (Join-Path $SourceDir "dist") $InstallDir -Recurse -Force
Copy-Item (Join-Path $SourceDir "package.json") $InstallDir -Force
Copy-Item (Join-Path $SourceDir "package-lock.json") $InstallDir -Force

Push-Location $InstallDir
try {
    & $NpmCmd ci --omit=dev
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudieron instalar las dependencias."
    }

    Write-Host ""
    Write-Host "Ahora configura el servidor, el token y las dos impresoras."
    & $NodeExe (Join-Path $InstallDir "dist\config\setup.js")
    if ($LASTEXITCODE -ne 0) {
        throw "La configuración inicial no terminó correctamente."
    }
}
finally {
    Pop-Location
}

if (-not (Test-Path (Join-Path $ConfigDir "agent.json"))) {
    throw "No se creó el archivo de configuración."
}

& icacls.exe $ConfigDir /inheritance:r `
    /grant:r "*S-1-5-18:(OI)(CI)F" `
    "*S-1-5-32-544:(OI)(CI)F" /T
if ($LASTEXITCODE -ne 0) {
    throw "No se pudieron proteger los permisos de configuración."
}

$LogDir = Join-Path $ConfigDir "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$runner = @'
$ErrorActionPreference = "Continue"
$LogDir = Join-Path $env:ProgramData "Pedidos360\logs"
$LogFile = Join-Path $LogDir "agent.log"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
Set-Location "__INSTALL_DIR__"
& "__NODE_EXE__" "dist\index.js" *>> $LogFile
exit $LASTEXITCODE
'@

$runner = $runner.Replace("__INSTALL_DIR__", $InstallDir)
$runner = $runner.Replace("__NODE_EXE__", $NodeExe)
Set-Content -Path (Join-Path $InstallDir "run-agent.ps1") -Value $runner -Encoding UTF8

& icacls.exe $LogDir /inheritance:r `
    /grant:r "*S-1-5-18:(OI)(CI)F" `
    "*S-1-5-32-544:(OI)(CI)F" /T
if ($LASTEXITCODE -ne 0) {
    throw "No se pudieron proteger los permisos de los registros."
}

$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"

$action = New-ScheduledTaskAction `
    -Execute $PowerShellExe `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$InstallDir\run-agent.ps1`"" `
    -WorkingDirectory $InstallDir

$trigger = New-ScheduledTaskTrigger -AtStartup

$principalTask = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RestartCount 999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principalTask `
    -Settings $settings `
    -Description "Agente de impresión desatendido de Pedidos360" `
    -Force | Out-Null

Start-ScheduledTask -TaskName $TaskName

Write-Host ""
Write-Host "Instalación registrada. El agente arrancará con Windows."
Write-Host "Verifica el estado con: Get-ScheduledTask -TaskName $TaskName"
