$zipFile = "Morsall_Hostinger_Deploy.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile }

# List of items to include
$include = @(".next", "public", "src", "prisma", "package.json", "package-lock.json", "next.config.js", ".env.production", "server-hostinger.js")

# Copy to a temporary folder to avoid zipping the cache
$tempDir = "temp_deploy"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir

foreach ($item in $include) {
    if (Test-Path $item) {
        $dest = Join-Path $tempDir $item
        if (Test-Path $item -PathType Container) {
            Copy-Item -Path $item -Destination $dest -Recurse -Force
        } else {
            Copy-Item -Path $item -Destination $dest -Force
        }
    }
}

# Remove cache from .next in temp folder
if (Test-Path "$tempDir/.next/cache") {
    Remove-Item -Recurse -Force "$tempDir/.next/cache"
}

# Create Zip
Compress-Archive -Path "$tempDir/*" -DestinationPath $zipFile -Force

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Host "ZIP created successfully: $((Get-Item $zipFile).Length / 1MB) MB"
