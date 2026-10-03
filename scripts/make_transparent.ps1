[Reflection.Assembly]::LoadWithPartialName("System.Drawing")
$bitmap = New-Object System.Drawing.Bitmap("c:\Active Projects\SharmaSir_Website_PNPM\public\assets\images\signature.png")
for ($x = 0; $x -lt $bitmap.Width; $x++) {
    for ($y = 0; $y -lt $bitmap.Height; $y++) {
        $pixel = $bitmap.GetPixel($x, $y)
        # If the pixel is close to white (high R, G, B), make it transparent
        if ($pixel.R -gt 200 -and $pixel.G -gt 200 -and $pixel.B -gt 200) {
            $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}
# Save the transparent image, overwriting the original signature image
$bitmap.Save("c:\Active Projects\SharmaSir_Website_PNPM\public\assets\images\signature_transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
Write-Host "Transparency processing completed successfully!"
