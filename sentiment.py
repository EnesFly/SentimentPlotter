from textblob import TextBlob

def analyze_sentiments(sentences):
    for sentence in sentences:
        blob = TextBlob(sentence)
        sentiment = blob.sentiment
        print(f"Sentence: '{sentence}'")
        print(f"Sentiment: Polarity = {sentiment.polarity}, Subjectivity = {sentiment.subjectivity}\n")
        print(f"********************************")

# Example usage
input_sentences = [
    "I love Zara.",
    "I hate the clothes from Zara.",
    "The clothes of Zara was a bit boring, but the quality was beautiful.",
    "I enjoy shopping from Zara",
    "Zara sucks!"

]

analyze_sentiments(input_sentences)
