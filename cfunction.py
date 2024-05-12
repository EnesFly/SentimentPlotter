import functions_framework
from google.cloud import storage, firestore
import csv
from textblob import TextBlob
from collections import defaultdict
from datetime import datetime
import json

@functions_framework.http
def process_csv(request):
    print("Received request to process CSV...")
    try:
        request_data = request.get_json()
        if request_data is None:
            print("No data in request.")
            return ("Failed to parse request body as JSON.", 400)

        keyword = request_data.get("keyword")
        if not keyword:
            print("No keyword provided.")
            return ("Keyword is missing in the request body.", 400)
    except Exception as e:
        print(f"Exception while parsing request: {str(e)}")
        return (f"Error parsing request body: {str(e)}", 400)

    print("Initializing storage and firestore clients...")
    storage_client = storage.Client()
    firestore_client = firestore.Client()

    bucket_name = 'se560-sentiment.appspot.com'
    file_path = 'data/tweets2009-06.csv'

    print(f"Accessing bucket: {bucket_name}")
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_path)
    print("Downloading CSV text...")
    csv_text = blob.download_as_text(encoding='utf-8')  # Assuming UTF-8 encoding

    reader = csv.reader(csv_text.splitlines())
    daily_sentiments = defaultdict(list)

    print("Processing rows...")
    for row in reader:
        if len(row) < 3:
            continue

        tweet_time, tweet_content = row[1], row[2]
        if keyword.lower() in tweet_content.lower():
            polarity = TextBlob(tweet_content).sentiment.polarity
            tweet_date = tweet_time.split()[0]
            daily_sentiments[tweet_date].append(polarity)

    print("Calculating results...")
    results = {date: sum(scores) / len(scores) for date, scores in daily_sentiments.items()}
    document_id = str(datetime.utcnow().timestamp())
    results_data = [{'date': date, 'average_polarity': avg_polarity} for date, avg_polarity in results.items()]

    print("Uploading results to Firestore...")
    doc_ref = firestore_client.collection('sentiment_analysis').document(document_id)
    doc_ref.set({
        'keyword': keyword,
        'results': results_data,
        'status': 'completed'  # Add a status field
    })

    print("Upload complete.")
    return (json.dumps({'keyword': keyword, 'status': 'done'}), 200, {'Content-Type': 'application/json'})