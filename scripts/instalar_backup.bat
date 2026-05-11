@echo off
:: Este archivo se ejecuta UNA SOLA VEZ como Administrador
:: para registrar el backup diario automatico

powershell.exe -ExecutionPolicy Bypass -Command ^
  "$action  = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File ""c:\Users\Panisse Optica Lugo\Desktop\Web Panisse\scripts\backup.ps1""'; ^
   $trigger = New-ScheduledTaskTrigger -Daily -At 10:00; ^
   $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 1) -StartWhenAvailable; ^
   Register-ScheduledTask -TaskName 'PanisseOptica_BackupDiario' -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force; ^
   Write-Host 'Tarea registrada correctamente. Backup diario a las 10:00.' -ForegroundColor Green"

pause
