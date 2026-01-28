# Restart Ollama Service to clear VRAM
Write-Host "Stopping Ollama..."
taskkill /F /IM "ollama.exe" /T
taskkill /F /IM "ollama_llama_server.exe" /T

Write-Host "Waiting for VRAM release..."
Start-Sleep -Seconds 3

Write-Host "Starting Ollama..."
Start-Process "ollama" "serve" -NoNewWindow

Write-Host "Done! Ollama restarted. VRAM should be clear."
Write-Host "Please restart your Z-KATT simulation now."
