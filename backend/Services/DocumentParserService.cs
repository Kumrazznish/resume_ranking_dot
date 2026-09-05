using System.Text;
using UglyToad.PdfPig;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace ResumeRanker.Api.Services;

public interface IDocumentParserService
{
    Task<(string Text, int CharacterCount)> ExtractTextAsync(Stream fileStream, string filename);
}

public class DocumentParserService : IDocumentParserService
{
    private readonly ILogger<DocumentParserService> _logger;

    public DocumentParserService(ILogger<DocumentParserService> logger)
    {
        _logger = logger;
    }

    public async Task<(string Text, int CharacterCount)> ExtractTextAsync(Stream fileStream, string filename)
    {
        var lower = filename.ToLowerInvariant();
        string extracted = string.Empty;

        using var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream);
        var bytes = memoryStream.ToArray();

        if (lower.EndsWith(".pdf"))
        {
            try
            {
                using var pdfDoc = PdfDocument.Open(bytes);
                var sb = new StringBuilder();
                foreach (var page in pdfDoc.GetPages())
                {
                    sb.AppendLine(page.Text);
                }
                extracted = sb.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[DocumentParser] PdfPig failed for {Filename}, attempting raw stream fallback", filename);
                var raw = Encoding.Latin1.GetString(bytes);
                var matches = System.Text.RegularExpressions.Regex.Matches(raw, @"\(([^)]+)\)");
                var sb = new StringBuilder();
                foreach (System.Text.RegularExpressions.Match m in matches)
                {
                    if (m.Groups.Count > 1) sb.Append(m.Groups[1].Value).Append(' ');
                }
                extracted = sb.ToString();
            }
        }
        else if (lower.EndsWith(".docx") || lower.EndsWith(".doc"))
        {
            try
            {
                using var docStream = new MemoryStream(bytes);
                using var wordDoc = WordprocessingDocument.Open(docStream, false);
                var body = wordDoc.MainDocumentPart?.Document?.Body;
                if (body != null)
                {
                    var sb = new StringBuilder();
                    foreach (var text in body.Descendants<Text>())
                    {
                        sb.Append(text.Text).Append(' ');
                    }
                    extracted = sb.ToString();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[DocumentParser] OpenXml docx parsing failed for {Filename}", filename);
                extracted = Encoding.UTF8.GetString(bytes);
            }
        }
        else
        {
            extracted = Encoding.UTF8.GetString(bytes);
        }

        // Clean control characters and normalize whitespace
        var cleaned = System.Text.RegularExpressions.Regex.Replace(extracted, @"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]", "");
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"\s+", " ").Trim();

        return (cleaned, cleaned.Length);
    }
}
