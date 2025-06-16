# $uri = "http://localhost:3000/api/auth/login"

# $body = @{
#     email = "test@example.com"
#     password = "123456"
# } | ConvertTo-Json

# $headers = @{
#     "Content-Type" = "application/json"
# }

# $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -Headers $headers

# $response

$uri = "http://localhost:3000/api/auth/login"

$body = @{
    email = "test@example.com"
    password = "123456"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -Headers $headers

    if ($response.token) {
        Write-Host "Login successful! Token received:"
        Write-Host $response.token
    } else {
        Write-Host "Login failed or token not received."
    }
} catch {
    Write-Host "Error occurred during request:"
    Write-Host $_.Exception.Message
}
