# Get all uncommitted changes
$changes = git status --porcelain -uall

if ($changes.Count -eq 0) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    exit
}

Write-Host "Starting batch commit for $($changes.Count) files..." -ForegroundColor Cyan

foreach ($line in $changes) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    # Git porcelain format: XY Path
    $status = $line.Substring(0, 2).Trim()
    $file = $line.Substring(3).Trim()
    
    # Remove quotes if they exist around the filename (Git does this sometimes)
    $file = $file -replace '^"', '' -replace '"$', ''
    
    Write-Host "Committing: $file" -ForegroundColor Gray
    
    # Stage the file
    git add "$file"
    
    # Determine commit message
    $prefix = if ($status -eq "??") { "feat: add" } else { "chore: update" }
    $filename = Split-Path -Leaf "$file"
    $msg = "$prefix $filename"
    
    # Commit
    git commit -m "$msg"
}

Write-Host "Batch commit complete! You can now push your changes manually." -ForegroundColor Green
