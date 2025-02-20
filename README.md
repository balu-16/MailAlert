# 📩 Email Keyword Alert System

A Python script that monitors your email inbox and alerts you whenever an email contains a specified keyword. This project uses **IMAP** to fetch emails and checks for specific words in the email body.

## 🚀 Features

- 🔍 Scans both **read and unread** emails
- 📌 Alerts when a keyword is found in the email body
- 🕰 Converts email timestamps to **Indian Standard Time (IST)**
- ⏳ Optimized to check only the last **50 emails** for better performance

## 🛠 Installation

### 1️⃣ Clone the repository

```sh
git clone [https://github.com/your-username/MailAlert.git](https://github.com/your-username/MailAlert.git)
cd MailAlert
2️⃣ Install dependencies
Create a virtual environment (optional but recommended):

Bash

python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate  # On Windows
Then install the required dependencies:

Bash

pip install -r requirements.txt
Example requirements.txt content:

imaplib
email
datetime
pytz  # For timezone conversions
🔧 Configuration
Enable IMAP access for your Gmail account.
Generate a Gmail App Password instead of using your actual password.
Modify the script to use your credentials:
Python

EMAIL_USER = "your-email@gmail.com"
EMAIL_PASS = "your-app-password"
🏃‍♂️ Usage
Run the script and enter a keyword to monitor:

Bash

python main.py
Example Output:

Enter the keyword to alert on: opportunity

Connecting to the email server...
Fetching all emails...

📩 Email Found:
From: example@example.com
Received on (IST): 2025-02-20 14:29:20
Subject: Exciting Job Opportunity for You!
⚠️ ALERT: Email contains the keyword 'opportunity'
Message: Hey, I found a great opportunity for you...
🛡 Security Warning
⚠ Do NOT hardcode your password in the script. Use an App Password for better security.

📜 License
This project is licensed under the MIT License.

🔗 Developed by Balarakesh Gundapaneni
