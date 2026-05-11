# ============================================================
#  Panisse Óptica — Backup diario automático
#  Se ejecuta cada día a las 10:00 via Programador de Tareas
# ============================================================

$projectPath = "c:\Users\Panisse Óptica Lugo\Desktop\Web Panisse"
$backupFolder = "c:\Users\Panisse Óptica Lugo\Desktop\Panisse_Backups"
$maxBackups   = 7

# Crear carpeta de backups si no existe
if (-not (Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder | Out-Null
}

# Nombre del archivo con fecha de hoy
$date     = Get-Date -Format "yyyy-MM-dd"
$zipPath  = Join-Path $backupFolder "Panisse_Backup_$date.zip"

# Si ya existe un backup de hoy, no duplicar
if (Test-Path $zipPath) {
    Write-Output "Backup de hoy ya existe: $zipPath"
    exit 0
}

# Recoger todos los archivos excepto node_modules
$files = Get-ChildItem -Path $projectPath -Recurse | Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\Panisse_Backups\\' -and
    -not $_.PSIsContainer
}

# Crear el ZIP
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

foreach ($file in $files) {
    $entryName = $file.FullName.Substring($projectPath.Length + 1)
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $zip, $file.FullName, $entryName
    ) | Out-Null
}

$zip.Dispose()

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Output "Backup creado: $zipPath ($sizeMB MB, $($files.Count) archivos)"

# Borrar backups antiguos — conservar solo los últimos $maxBackups
$allBackups = Get-ChildItem -Path $backupFolder -Filter "Panisse_Backup_*.zip" |
              Sort-Object CreationTime -Descending

if ($allBackups.Count -gt $maxBackups) {
    $toDelete = $allBackups | Select-Object -Skip $maxBackups
    foreach ($old in $toDelete) {
        Remove-Item $old.FullName -Force
        Write-Output "Eliminado backup antiguo: $($old.Name)"
    }
}
