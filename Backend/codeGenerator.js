import axios from 'axios'

// Function to make the API call to Codex
async function completeCode(prompt) {
  try {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.8,
      n: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      }
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.log(error.message)
    //console.error('Error:', error.response.data);
    throw error;
  }
}

// Example usage
async function run() {
  const prompt = `
  const numbers = [1, 2, 3, 4, 5];
  const doubledNumbers = numbers.map(number => number * 2);
  console.log(doubledNumbers);
  `;

  try {
    const completion = await completeCode(prompt);
    console.log('Completion:', completion);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();