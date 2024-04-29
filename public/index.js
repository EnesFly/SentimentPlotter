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

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('analysisForm').addEventListener('submit', function(event) {
      event.preventDefault();

      const keyword = document.getElementById('keywords').value;
      if (!keyword) {
          alert('Please enter a keyword.');
          return;
      }

      const resultsSection = document.getElementById('results');
      resultsSection.innerHTML = 'Request sent. Waiting for data...';

      // Attempt to fetch data with retries
      sendRequestWithRetry('/processCsv', keyword, 3); // Retry up to 3 times
  });
});

function sendRequestWithRetry(url, keyword, retries) {
  fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({keyword: keyword})
  })
  .then(response => {
      if (!response.ok) throw new Error('Network response was not ok.');
      return response.json();
  })
  .then(data => {
      console.log("Received data from Cloud Function:", data);
      listenForResults(keyword);
  })
  .catch(error => {
      console.error('Attempt failed, retries left:', retries, error);
      const resultsSection = document.getElementById('results');
      if (retries > 0) {
          console.log("Retrying...");
          setTimeout(() => sendRequestWithRetry(url, keyword, retries - 1), 2000); // wait 2 seconds before retrying
      } else {
          resultsSection.innerHTML = 'Failed to retrieve analysis results after multiple attempts. Please try again later.';
      }
  });
}



function plotData(data) {
  const resultsSection = document.getElementById('results');
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
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Sentiment Analysis Result' } }
      }
    }
  });

  console.log("Chart plotted for keyword:", data.keyword);
}

function generateRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}
