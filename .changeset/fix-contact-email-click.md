---
"portfolio": patch
---

Fix Contact page email link silently failing for users without a default mail client. Clicking the email now copies it to the clipboard with visible feedback while still attempting to open the user's mail app. Also redirects the Footer "Contact" link to the /contact page instead of mailto:.
