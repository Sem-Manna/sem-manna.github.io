# Build cyc on Windows with Git for Windows and a GCC/Make toolchain.
[CmdletBinding()]
param(
    [string]$BashPath,
    [string]$MakePath,
    [string]$GccPath
)

$ErrorActionPreference = 'Stop'

function Find-BuildTool {
    param([string]$ExplicitPath, [string[]]$Names, [string[]]$Candidates)

    if ($ExplicitPath) {
        if (-not (Test-Path -LiteralPath $ExplicitPath -PathType Leaf)) {
            throw "Build tool not found: $ExplicitPath"
        }
        return (Resolve-Path -LiteralPath $ExplicitPath).Path
    }
    foreach ($candidate in $Candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate -PathType Leaf)) {
            return $candidate
        }
    }
    foreach ($name in $Names) {
        $command = Get-Command $name -CommandType Application -ErrorAction SilentlyContinue
        if ($command) { return $command.Source }
    }
    throw "Cannot find $($Names -join ' or '). Supply its path as a script parameter."
}

function Invoke-FileOperation {
    param([scriptblock]$Operation)
    for ($attempt = 1; $attempt -le 5; $attempt++) {
        try { & $Operation; return }
        catch {
            if ($attempt -eq 5) { throw }
            Start-Sleep -Milliseconds 200
        }
    }
}

$BashPath = Find-BuildTool $BashPath @('bash.exe') @(
    "$env:ProgramFiles\Git\bin\bash.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe"
)
$MakePath = Find-BuildTool $MakePath @('gmake.exe', 'make.exe', 'mingw32-make.exe') @(
    'C:\Strawberry\c\bin\gmake.exe'
)
$GccPath = Find-BuildTool $GccPath @('gcc.exe') @('C:\Strawberry\c\bin\gcc.exe')

$projectRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$publicPath = [IO.Path]::GetFullPath((Join-Path $projectRoot 'public'))
if (-not $publicPath.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Generated output must stay inside the website directory.'
}
if (Test-Path -LiteralPath $publicPath) {
    $publicItem = Get-Item -Force -LiteralPath $publicPath
    # Dropbox also uses reparse points for ordinary synced directories.
    if ($publicItem.LinkType -in @('SymbolicLink', 'Junction')) {
        throw 'The generated public directory must not be a symbolic link or junction.'
    }
}

$previousPath = $env:PATH
$temporaryBase = (Resolve-Path -LiteralPath ([IO.Path]::GetTempPath())).Path.TrimEnd('\')
$buildDirectory = [IO.Path]::GetFullPath((Join-Path $temporaryBase ('cyc-build-' + [Guid]::NewGuid().ToString('N'))))
if (-not $buildDirectory.StartsWith($temporaryBase + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Temporary build directory must stay inside the system temporary directory.'
}
try {
    New-Item -ItemType Directory -Path $buildDirectory | Out-Null
    # Build outside Dropbox: its sync reparse points can block Git Bash renames.
    # Include custom source folders, but never history or previous build output.
    foreach ($sourceItem in (Get-ChildItem -Force -LiteralPath $projectRoot)) {
        if ($sourceItem.Name -in @('.git', 'public')) { continue }
        if ($sourceItem.Name -eq 'bin') {
            $temporaryBin = Join-Path $buildDirectory 'bin'
            New-Item -ItemType Directory -Path $temporaryBin | Out-Null
            foreach ($helper in (Get-ChildItem -Force -LiteralPath $sourceItem.FullName)) {
                if ($helper.Name -in @('replace', 'mtime', 'replace.exe', 'mtime.exe')) { continue }
                Copy-Item -LiteralPath $helper.FullName -Destination $temporaryBin -Recurse -Force
            }
        }
        else {
            Copy-Item -LiteralPath $sourceItem.FullName -Destination $buildDirectory -Recurse -Force
        }
    }
    $gitDirectory = Split-Path (Split-Path $BashPath -Parent) -Parent
    $env:PATH = @(
        (Join-Path $gitDirectory 'usr\bin'),
        (Split-Path $BashPath -Parent),
        (Split-Path $GccPath -Parent),
        (Split-Path $MakePath -Parent),
        $previousPath
    ) -join ';'
    Push-Location -LiteralPath $buildDirectory
    try {
        # Command-line variables propagate to recursive GNU Make invocations.
        & $MakePath ('SHELL=' + $BashPath.Replace('\', '/')) 'CC=gcc' all
        if ($LASTEXITCODE -ne 0) { throw "Website build failed (exit $LASTEXITCODE)." }
        $generatedPublic = Join-Path $buildDirectory 'public'
        if (-not (Test-Path -LiteralPath (Join-Path $generatedPublic 'index.html') -PathType Leaf)) {
            throw 'Build completed without public/index.html.'
        }
        # Preserve the last working preview until the complete build succeeds.
        # Keep directories in place: Dropbox can lock even native folder removal.
        New-Item -ItemType Directory -Path $publicPath -Force | Out-Null
        Invoke-FileOperation {
            foreach ($generatedItem in (Get-ChildItem -Force -LiteralPath $generatedPublic)) {
                Copy-Item -LiteralPath $generatedItem.FullName -Destination $publicPath -Recurse -Force
            }
        }
        $generatedFiles = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
        foreach ($generatedFile in (Get-ChildItem -Force -LiteralPath $generatedPublic -Recurse -File)) {
            [void]$generatedFiles.Add($generatedFile.FullName.Substring($generatedPublic.Length + 1))
        }
        foreach ($publishedFile in (Get-ChildItem -Force -LiteralPath $publicPath -Recurse -File)) {
            $relativeFile = $publishedFile.FullName.Substring($publicPath.Length + 1)
            if (-not $generatedFiles.Contains($relativeFile)) {
                Invoke-FileOperation { Remove-Item -LiteralPath $publishedFile.FullName -Force }
            }
        }
        Write-Host "Built website: $publicPath"
    }
    finally { Pop-Location }
}
finally {
    $env:PATH = $previousPath
    if (Test-Path -LiteralPath $buildDirectory) {
        Remove-Item -LiteralPath $buildDirectory -Recurse -Force
    }
}
