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

document.getElementById('analysisForm')
    .addEventListener('submit', async function(event) {
      event.preventDefault();

      // Extract form data
      const keywordsInput = document.getElementById('keywords').value;
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;

      // Check for input validity
      if (!keywordsInput || !startDate || !endDate) {
        alert('Please ensure all fields are filled out correctly.');
        return;
      }

      // Split the input keywords by comma and trim whitespace
      const keywords = keywordsInput.split(',').map(keyword => keyword.trim());

      // Retrieve data from Firestore for each keyword
      const allData = [];
      for (const keyword of keywords) {
        const snapshot = await firebase.firestore()
                             .collection('sentiments')
                             .where('word', '==', keyword)
                             .where('timestamp', '>=', new Date(startDate))
                             .where('timestamp', '<=', new Date(endDate))
                             .get();
        const data = snapshot.docs.map(doc => doc.data());
        allData.push({keyword, data});
      }

      // Plot all data
      plotData(allData);
    });

// Function to format timestamp to a readable date
function formatDate(timestamp) {
  const date =
      new Date(timestamp.seconds * 1000);  // Convert seconds to milliseconds
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1))
                    .slice(-2);  // Add leading zero if month is a single digit
  const day = ('0' + date.getDate())
                  .slice(-2);  // Add leading zero if day is a single digit
  return `${year}-${month}-${day}`;  // Format: YYYY-MM-DD
}

// Function to plot the data
function plotData(allData) {
  // Clear existing graphs
  const resultsSection = document.getElementById('results');
  resultsSection.innerHTML = '';

  allData.forEach(({keyword, data}) => {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for canvas.');
      return;
    }

    const timestamps = data.map(item => formatDate(item.timestamp));
    const sentiments = data.map(item => item.sentiment);

    const color = generateRandomColor();  // Generate random color

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: keyword,
          data: sentiments,
          borderColor: color,  // Use random color for current dataset
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

    // Append the canvas element to the results section
    resultsSection.appendChild(ctx.canvas);
  });
}

// Function to generate random RGB color
function generateRandomColor() {
  const r = Math.floor(
      Math.random() * 256);  // Random value between 0 and 255 for red
  const g = Math.floor(
      Math.random() * 256);  // Random value between 0 and 255 for green
  const b = Math.floor(
      Math.random() * 256);        // Random value between 0 and 255 for blue
  return `rgb(${r}, ${g}, ${b})`;  // Return RGB color string
}
