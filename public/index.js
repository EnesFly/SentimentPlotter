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
      const keyword = document.getElementById('keywords').value;
      const resultsSection = document.getElementById('results');
      resultsSection.innerHTML = '<div class="loader"></div>';

      if (keyword) {
        const response = await fetch('/processCsv', {
          method: 'POST',
          body: JSON.stringify({keyword: keyword}),
          headers: {'Content-Type': 'application/json'}
        });
        watchResults(keyword);
        const result = await response.json();
        if (result.status === 'done') {
          console.log('Analysis started, waiting for results...');
          watchResults(keyword);
        } else {
          console.error('Failed to start analysis:', result);
          resultsSection.innerHTML = 'Analysis failed. Please try again.';
        }
      }
    });

// Watch for Firestore updates
function watchResults(keyword) {
  db.collection('sentiment_analysis')
      .where('keyword', '==', keyword)
      .where('status', '==', 'completed')
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            plotData({
              keyword: change.doc.data().keyword,
              results: change.doc.data().results
            });
          }
        });
      });
}

function plotData(data) {
  const resultsSection = document.getElementById('results');
  resultsSection.innerHTML = '';  // Clear previous results
  const chartContainer = document.createElement('canvas');
  chartContainer.id = `chart-${data.keyword}`;
  resultsSection.appendChild(chartContainer);
  const ctx = chartContainer.getContext('2d');
  const dates = data.results.map(item => item.date);
  const sentiments = data.results.map(item => item.average_polarity);
  const color = generateRandomColor();

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: `Sentiment for ${data.keyword}`,
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

  console.log('Chart plotted for keyword:', data.keyword);
}

function generateRandomColor() {
  return `rgb(${Math.floor(Math.random() * 256)}, ${
      Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}