// Existing code
// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBe_QqXnaDC465AgwZNKGJVxWMHtb-_Asw',
  authDomain: 'se560-sentiment.firebaseapp.com',
  projectId: 'se560-sentiment',
  storageBucket: 'se560-sentiment.appspot.com',
  messagingSenderId: '920804186007',
  appId: '1:920804186007:web:2518d8b1e5b0a4e31d96d2',
  measurementId: 'G-ZN1CDKC85F'
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Listen for submissions of the analysis form and trigger the cloud function
document.getElementById('analysisForm')
    .addEventListener('submit', async function(event) {
      event.preventDefault();
      const keywords = document.getElementById('keywords').value;
      const resultsSection = document.getElementById('results');
      resultsSection.innerHTML = '<div class="loader"></div>';

      if (keywords) {
        const response = await fetch('/processCsv', {
          method: 'POST',
          body: JSON.stringify({keywords: keywords}),
          headers: {'Content-Type': 'application/json'}
        });
        watchResults(keywords.split(',').map(kw => kw.trim()));
        const result = await response.json();
        if (result.status === 'done') {
          console.log('Analysis started, waiting for results...');
          watchResults(keywords.split(',').map(kw => kw.trim()));
        } else {
          console.error('Failed to start analysis:', result);
          resultsSection.innerHTML = 'Analysis failed. Please try again.';
        }
      }
    });

// Watch for Firestore updates
function watchResults(keywords) {
  keywords.forEach(keyword => {
    db.collection('sentiment_analysis')
        .where('keywords', 'array-contains', keyword)
        .where('status', '==', 'completed')
        .onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              removeLoader();
              plotData(change.doc.data().results[keyword], keyword);
            }
          });
        });
  });
}

function plotData(data, keyword) {
  const resultsSection = document.getElementById('results');
  const chartContainer = document.createElement('canvas');
  chartContainer.id = `chart-${keyword}`;
  resultsSection.appendChild(chartContainer);
  const ctx = chartContainer.getContext('2d');
  const dates = data.map(item => item.date);
  const sentiments = data.map(item => item.average_polarity);
  const color = generateRandomColor();

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: `Sentiment for ${keyword}`,
        data: sentiments,
        borderColor: color,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {title: {display: true, text: 'Date'}},
        y: {title: {display: true, text: 'Sentiment Analysis Result'}}
      }
    }
  });

  console.log('Chart plotted for keyword:', keyword);
}

function removeLoader() {
  const loader = document.querySelector('.loader');
  if (loader) {
    loader.remove();
  }
}

function generateRandomColor() {
  return `rgb(${Math.floor(Math.random() * 256)}, ${
      Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}