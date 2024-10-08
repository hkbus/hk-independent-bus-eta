if "%VITE_COMMIT_HASH%"== "" (
  for /f "delims=" %%a in ('git rev-parse --short HEAD') do (
    set VITE_COMMIT_HASH=%%a
  )
)

if "%VITE_COMMIT_MESSAGE%"== "" (
  for /f "delims=" %%a in ('git log -1 --pretty^=format:%%s') do (
    set VITE_COMMIT_MESSAGE=%%a
  )
)

if "%VITE_VERSION%"== "" (
  for /f "usebackq delims=s" %%a in (`powershell -Command "Write-Host $(node -e 'console.log(require(''./package.json'').version)')"`) do (
    set VITE_VERSION=%%a
  )
)

if "%VITE_REPO_URL%"== "" (
  for /f "delims=" %%a in ('git config --get remote.origin.url') do (
    set VITE_REPO_URL=%%a
  )
)

