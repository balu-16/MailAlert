import imaplib
import email
from email.header import decode_header
from datetime import datetime
import pytz
from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

# Use environment variables for sensitive credentials
EMAIL_USER = os.environ.get("EMAIL_USER", "gbalarakesh16@gmail.com")
EMAIL_PASS = os.environ.get("EMAIL_PASS", "kihevautgfklafej")  # App Password
IMAP_SERVER = "imap.gmail.com"


def decode_content(payload, encoding=None):
    try:
        if isinstance(payload, bytes):
            return payload.decode(encoding or "utf-8", errors="ignore")
        elif isinstance(payload, str):
            return payload
        else:
            return str(payload)
    except Exception as e:
        print(f"Decoding error: {e}")
        return ""


def convert_to_ist(date_str):
    try:
        # Parse the date string into a datetime object
        utc_time = email.utils.parsedate_to_datetime(date_str)
        # Set the timezone to UTC
        utc_time = utc_time.replace(tzinfo=pytz.utc)
        # Convert to Indian Standard Time (IST)
        ist_time = utc_time.astimezone(pytz.timezone('Asia/Kolkata'))
        # Format the date as needed
        return ist_time.strftime('%Y-%m-%d %H:%M:%S')
    except Exception as e:
        print(f"Date conversion error: {e}")
        return "Unknown date"


def check_emails(keyword):
    results = []
    errors = []
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_USER, EMAIL_PASS)
        mail.select("inbox")

        # Fetch both seen and unseen emails
        status, messages = mail.search(None, "ALL")

        if status != "OK":
            errors.append("Error fetching emails.")
            return {"results": results, "errors": errors, "count": 0}

        email_ids = messages[0].split()
        total_emails = len(email_ids)

        if not email_ids:
            errors.append("No emails found.")
            return {"results": results, "errors": errors, "count": 0}

        # Limit to checking only the last 50 emails for faster performance
        for e_id in email_ids[-50:]:
            status, msg_data = mail.fetch(e_id, "(RFC822)")

            if status != "OK":
                errors.append(f"Error fetching email ID {e_id.decode()}")
                continue

            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])

                    # Handle subject
                    subject_header = msg.get("Subject", "")
                    if subject_header:
                        subject_parts = decode_header(subject_header)
                        subject = ""
                        for part, encoding in subject_parts:
                            if isinstance(part, bytes):
                                subject += part.decode(encoding or 'utf-8',
                                                       errors='ignore')
                            else:
                                subject += str(part)
                    else:
                        subject = "(No subject)"

                    # Get sender and date
                    sender = msg.get("From", "(Unknown sender)")
                    date_received = msg.get("Date")

                    if date_received:
                        date_received_ist = convert_to_ist(date_received)
                    else:
                        date_received_ist = "Unknown date"

                    # Extract body
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            content_type = part.get_content_type()
                            content_disposition = str(
                                part.get("Content-Disposition"))

                            # Skip attachments
                            if "attachment" in content_disposition:
                                continue

                            if content_type == "text/plain":
                                try:
                                    payload = part.get_payload(decode=True)
                                    if payload:
                                        body = decode_content(
                                            payload, part.get_content_charset())
                                        break
                                except Exception as e:
                                    print(
                                        f"Error extracting multipart body: {e}")
                    else:
                        try:
                            payload = msg.get_payload(decode=True)
                            if payload:
                                body = decode_content(
                                    payload, msg.get_content_charset())
                        except Exception as e:
                            print(f"Error extracting body: {e}")

                    # Clean up the body
                    body = body.strip().replace("\n", " ").replace("\r", " ")
                    # Limit to 300 chars
                    body = (body[:297] + "...") if len(body) > 300 else body

                    # Convert everything to strings for safe JSON serialization
                    subject = str(subject)
                    sender = str(sender)
                    body = str(body)

                    # Check if keyword is in subject or body
                    if keyword.lower() in body.lower() or keyword.lower() in subject.lower():
                        results.append({
                            "sender": sender,
                            "date": date_received_ist,
                            "subject": subject,
                            "body": body
                        })

        mail.logout()
        return {"results": results, "errors": errors, "count": total_emails}
    except Exception as e:
        errors.append(f"Error: {str(e)}")
        return {"results": results, "errors": errors, "count": 0}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/search', methods=['POST'])
def search():
    keyword = request.form.get('keyword', '')
    if not keyword:
        return jsonify({"error": "Keyword is required"})

    results = check_emails(keyword)
    return jsonify(results)


if __name__ == "__main__":
    # Use PORT environment variable for deployment platforms
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "127.0.0.1")  # Default to localhost
    app.run(host=host, port=port, debug=False)
