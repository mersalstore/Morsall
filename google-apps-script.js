/**
 * Google Apps Script Mail Sender Proxy
 * 
 * Instructions:
 * 1. Go to https://script.google.com/
 * 2. Create a new project.
 * 3. Replace all default code with this file's contents.
 * 4. Click "Deploy" > "New Deployment"
 * 5. Choose Select type: "Web App"
 * 6. Set Description: "Morsall Mail Sender Proxy"
 * 7. Set Execute as: "Me (your-email@gmail.com)"
 * 8. Set Who has access: "Anyone"
 * 9. Click "Deploy" and authorize the script.
 * 10. Copy the "Web App URL" and add it to your Next.js project's .env file:
 *     GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var to = data.to;
    var subject = data.subject;
    var htmlBody = data.htmlBody;
    
    if (!to || !subject || !htmlBody) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Missing parameters (to, subject, htmlBody)" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody
    });
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
