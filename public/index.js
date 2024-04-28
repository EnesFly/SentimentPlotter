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

document.getElementById('analysisForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const keywordsInput = document.getElementById('keywords').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (!keywordsInput || !startDate || !endDate) {
      alert('Please ensure all fields are filled out correctly.');
      return;
  }

  const keywords = keywordsInput.split(',').map(keyword => keyword.trim());
  unsubscribeListeners();
  const resultsSection = document.getElementById('results');
  resultsSection.innerHTML = '';

  keywords.forEach((keyword) => {
      const listener = firebase.firestore()
          .collection('sentiments')
          .where('word', '==', keyword)
          .where('timestamp', '>=', new Date(startDate))
          .where('timestamp', '<=', new Date(endDate))
          .onSnapshot(snapshot => {
              const data = snapshot.docs.map(doc => doc.data());
              if (data.length > 0) {
                  plotData({ keyword, data });
              }
          });

      activeListeners.push({ keyword, listener });
  });
});

const activeListeners = [];

function unsubscribeListeners() {
  activeListeners.forEach(({ listener }) => listener());
  activeListeners.length = 0;
}

function plotData({ keyword, data }) {
  const resultsSection = document.getElementById('results');
  let chartContainer = document.getElementById(`chart-${keyword}`);
  if (!chartContainer) {
      chartContainer = document.createElement('canvas');
      chartContainer.id = `chart-${keyword}`;
      resultsSection.appendChild(chartContainer);
  }
  const ctx = chartContainer.getContext('2d');

  if (window[`chartInstance-${keyword}`]) {
      window[`chartInstance-${keyword}`].destroy();
  }

  const timestamps = data.map(item => formatDate(item.timestamp));
  const sentiments = data.map(item => item.sentiment);
  const color = generateRandomColor();

  const chart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: timestamps,
          datasets: [{
              label: keyword,
              data: sentiments,
              borderColor: color,
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
              x: { title: { display: true, text: 'Date' } },
              y: { title: { display: true, text: 'Sentiment Analysis Result' } }
          }
      }
  });

  window[`chartInstance-${keyword}`] = chart;
}

function formatDate(timestamp) {
  const date = new Date(timestamp.seconds * 1000);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

function generateRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}