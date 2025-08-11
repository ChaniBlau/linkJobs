# # הגדרת כתובות בסיס
# $baseUrl = "http://localhost:3000"
# $loginUrl = "$baseUrl/api/auth/login"
# $protectedUrl = "$baseUrl/api/jobs"
# $errorUrl = "$baseUrl/api/test-error"

# Write-Host "🔒 בדיקה 1: גישה ללא טוקן..."
# try {
#     Invoke-RestMethod -Uri $protectedUrl -Method Get -ErrorAction Stop
# } catch {
#     Write-Host "✅ התקבל צפי: " $_.Exception.Message
# }

# Write-Host "`n🔒 בדיקה 2: גישה עם טוקן לא תקין..."
# try {
#     Invoke-RestMethod -Uri $protectedUrl -Method Get -Headers @{ Authorization = "Bearer fake.token.here" } -ErrorAction Stop
# } catch {
#     Write-Host "✅ התקבל צפי: " $_.Exception.Message
# }

# Write-Host "`n🔑 בדיקה 3: התחברות וקבלת טוקן..."
# $loginBody = @{
#     email = "user@mail.com"    # <-- שימי את המייל הנכון
#     password = "123456"        # <-- ואת הסיסמה הנכונה
# } | ConvertTo-Json

# try {
#     $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
#     $token = $loginResponse.token
#     Write-Host "✅ התחברות הצליחה. טוקן: $token"
# } catch {
#     Write-Host "❌ שגיאה בהתחברות: " $_.Exception.Message
#     exit
# }

# Write-Host "`n🔓 בדיקה 4: גישה עם טוקן תקין..."
# try {
#     $response = Invoke-RestMethod -Uri $protectedUrl -Method Get -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
#     Write-Host "✅ הצלחה! התקבלה תשובה תקינה מהשרת."
# } catch {
#     Write-Host "❌ שגיאה לא צפויה: " $_.Exception.Message
# }

# Write-Host "`n🔥 בדיקה 5: שגיאה יזומה לבדוק ErrorHandler..."
# try {
#     Invoke-RestMethod -Uri $errorUrl -Method Get -ErrorAction Stop
# } catch {
#     Write-Host "✅ שגיאה נתפסה כראוי: " $_.Exception.Message
# }


