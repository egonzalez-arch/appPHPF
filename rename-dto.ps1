# Guarda este script como rename-dto-global.ps1 y ejecútalo en la raíz de tu repo

$Old = "CreateDoctorUserDto"
$New = "DoctorUserDetailsDto"
$BaseDir = "api\src"

Write-Host "Renombrando '$Old' por '$New' en $BaseDir ..."
Get-ChildItem -Path $BaseDir -Recurse -Include *.ts | ForEach-Object {
    $File = $_.FullName
    (Get-Content $File) -replace $Old, $New | Set-Content $File
    Write-Host "Actualizado: $File"
}
Write-Host "Renombrado completo."