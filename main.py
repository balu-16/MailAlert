import imaplib
import email
from email.header import decode_header
from datetime import datetime
import pytz

EMAIL_USER = "your-email@gmail.com"  
EMAIL_PASS = "your-app-password"    # Make sure to use an App Password!
IMAP_SERVER = "imap.gmail.com"
KEYWORD = input("Enter the keyword to alert on: ").lower()

def decode_content(payload, encoding=None):
    try:
        return payload.decode(encoding or "utf-8", errors="ignore")
    except Exception as e:
        print(f"Decoding error: {e}")
        return ""

def convert_to_ist(date_str):
    # Parse the date string into a datetime object
    utc_time = email.utils.parsedate_to_datetime(date_str)
    # Set the timezone to UTC
    utc_time = utc_time.replace(tzinfo=pytz.utc)
    # Convert to Indian Standard Time (IST)
    ist_time = utc_time.astimezone(pytz.timezone('Asia/Kolkata'))
    return ist_time.strftime('%Y-%m-%d %H:%M:%S')  # Format the date as needed

def check_emails():
    try:
        print("Connecting to the email server...")
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_USER, EMAIL_PASS)
        mail.select("inbox")

        # Fetch both seen and unseen emails
        print("Fetching all emails... (This may take a few seconds)")
        status, messages = mail.search(None, "ALL")

        if status != "OK":
            print("Error fetching emails.")
            return

        email_ids = messages[0].split()
        print(f"Total emails found: {len(email_ids)}")  # Debugging

        if not email_ids:
            print("No emails found.")
            return

        found_keyword = False  # Flag to track if any email contains the keyword

        # Limit to checking only the last 50 emails for faster performance
        for e_id in email_ids[-50:]:
            status, msg_data = mail.fetch(e_id, "(RFC822)")

            if status != "OK":
                print(f"Error fetching email ID {e_id.decode()}")
                continue

            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])

                    subject, encoding = decode_header(msg["Subject"])[0]
                    subject = subject.decode(encoding) if encoding else subject
                    sender = msg.get("From")
                    date_received = msg.get("Date")
                    date_received_ist = convert_to_ist(date_received)  # Convert to IST

                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            content_type = part.get_content_type()
                            if content_type == "text/plain":
                                payload = part.get_payload(decode=True)
                                body = decode_content(payload, part.get_content_charset())
                                break
                    else:
                        payload = msg.get_payload(decode=True)
                        body = decode_content(payload, msg.get_content_charset())

                    body = body.strip().replace("\n", " ").replace("\r", " ")
                    body = (body[:297] + "...") if len(body) > 300 else body  # Limit to 300 chars

                    if KEYWORD in body.lower():
                        print(f"\n📩 Email Found:")
                        print(f"From: {sender}")
                        print(f"Received on (IST): {date_received_ist}")
                        print(f"Subject: {subject}")
                        print(f"⚠️ ALERT: Email contains the keyword '{KEYWORD}'")
                        print(f"Message: {body}\n")
                        found_keyword = True  # Set flag to True if keyword is found

        if not found_keyword:
            print(f"No emails found with the keyword: {KEYWORD}")

        mail.logout()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_emails()
