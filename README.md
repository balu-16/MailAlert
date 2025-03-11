# 📧 Email Keyword Alert 🚨

This Python script monitors your Gmail inbox for a specific keyword and provides real-time alerts.

## ✨ Features ✨

* **Keyword Monitoring:** 🔍 Checks your Gmail inbox for emails containing a user-specified keyword.
* **Real-time Alerts:** 🔔 Prints an alert to the console when an email with the keyword is found.
* **IST Conversion:** 🇮🇳 Converts the email's received date and time to Indian Standard Time (IST).
* **Concise Output:** 📝 Displays sender, subject, received time (in IST), and a snippet of the email body.
* **Error Handling:** ⚠️ Includes basic error handling to catch potential issues.
* **Efficiency:** 🚀 Limits the search to the last 50 emails for faster execution.

## 🧑‍💻 How to Use 🧑‍💻

1.  **Installation:** Ensure you have Python installed. You'll need to install the `pytz` module if you don't have it:
    ```bash
    pip install pytz
    ```
2.  **Configuration:** Replace the placeholders in the script with your Gmail credentials. **Important:** Use an App Password for `EMAIL_PASS` for security reasons. You can generate an App Password in your Google Account settings.
3.  **Execution:** Run the Python script.
    ```bash
    python your_script_name.py
    ```
4.  **Interaction:** Enter the keyword you want to monitor when prompted.
5.  **View Alerts:** The script will print alerts to the console for any emails containing the keyword.

## 📂 Code Structure 📂

* `decode_content(payload, encoding=None)`: Decodes email content.
* `convert_to_ist(date_str)`: Converts date to IST.
* `check_emails()`: Main function to connect to Gmail, search for emails, and display alerts.

## 📝 Example Usage 📝

Enter the keyword to alert on: important\n
Connecting to the email server...\n
Fetching all emails... (This may take a few seconds)\n
Total emails found: 123\n
\n
📩 Email Found:\n
From: [email address removed]\n
Received on (IST): 2023-10-27 10:30:00\n
Subject: Important Meeting\n
⚠️ ALERT: Email contains the keyword 'important'\n
Message: We have an important meeting today...\n


## 🛠️ Future Improvements 🛠️

* More robust error handling and logging.
* Support for different email providers.
* Option to configure the number of emails to check.
* Implement email marking (e.g., marking as read) or deletion.
* Add notifications (e.g., desktop notifications).

## 🙌 Contributing 🙌

Contributions are welcome! Please feel free to submit pull requests or open issues.
