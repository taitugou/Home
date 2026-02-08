$url = "https://api.indexnow.org/indexnow"
$body = @{
  host = "home.taitugou.top"
  key = "64524190768249058694028563719028"
  keyLocation = "https://home.taitugou.top/64524190768249058694028563719028.txt"
  urlList = @(
    "https://home.taitugou.top/",
    "https://home.taitugou.top/chat.html",
    "https://home.taitugou.top/about.html"
  )
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json; charset=utf-8"
    Write-Host "Success! URLs submitted to IndexNow (Bing)." -ForegroundColor Green
    Write-Host "Response: $response"
} catch {
    Write-Host "Error submitting to IndexNow:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
