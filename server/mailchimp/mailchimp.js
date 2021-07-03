// const mailchimp = require('@mailchimp/mailchimp_transactional')('6YIcnDAx1K4YYx4yxh0x0w');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('6YIcnDAx1K4YYx4yxh0x0w');

// async function callPing() {
//   const response = await mailchimp.users.ping();
//   console.log('mailchimp', response);
// }

// callPing();

var message = {
  "html": "<p>Example HTML content</p>",
  "text": "Example text content",
  "subject": "test email",
  "from_email": "zach@viewportmedia.com",
  "from_name": "skillup server",
  "to": [
    {
      "email": "zachkadish@gmail.com",
      "name": "zach kadish",
      "type": "to"
    }
  ],
  "headers": null,
  "important": false,
  "track_opens": null,
  "track_clicks": null,
  "auto_text": null,
  "auto_html": null,
  "inline_css": null,
  "url_strip_qs": null,
  "preserve_recipients": null,
  "view_content_link": null,
  "bcc_address": null,
  "tracking_domain": "skilup.viewportmedia.com",
  "signing_domain": "viewportmedia.com",
  "return_path_domain": "viewportmedia.com",
  "merge": true,
  "merge_language": "mailchimp",
  "global_merge_vars": [{
          "name": "merge1",
          "content": "merge1 content"
      }],
  "merge_vars": [{
          "rcpt": "zachkadish@gmail.com",
          "vars": [{
                  "name": "merge2",
                  "content": "merge2 content"
              }]
      }],
  "tags": [
      "password-resets"
  ],
  "subaccount": null,
  "google_analytics_domains": null,
  "google_analytics_campaign": null,
  "metadata": {
      "website": "www.viewportmeida.com"
  },
  "recipient_metadata": [{
          "rcpt": "zachkadish@gmail.com",
          "values": {
              "user_id": 123456
          }
      }],
  "attachments": null,
  "images": null
};
var async = false;
var ip_pool = "Main Pool";
var send_at = "";
// mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
//   console.log('Email Result', result);
//   /*
//   [{
//           "email": "recipient.email@example.com",
//           "status": "sent",
//           "reject_reason": "hard-bounce",
//           "_id": "abc123abc123abc123abc123abc123"
//       }]
//   */
// }, function(e) {
//   // Mandrill returns the error as an object with name and message keys
//   console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
//   // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
// });