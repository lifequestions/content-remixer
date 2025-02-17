import { useState } from 'react'

function App() {
  const [content, setContent] = useState('')
  const [tweets, setTweets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRemix = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Sending request to server...'); // Debug log
      const response = await fetch('/api/remix', {  // Changed to use relative URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() })
      })

      console.log('Response received:', response.status); // Debug log

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tweets');
      }

      console.log('Data received:', data); // Debug log
      
      if (!data.tweets || !Array.isArray(data.tweets)) {
        throw new Error('Invalid response format from server');
      }
      
      setTweets(data.tweets)
    } catch (err) {
      console.error('Detailed error:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog Post to Tweets Converter</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Paste your blog post</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded h-48"
          placeholder="Paste your blog post here..."
        />
      </div>

      <button
        onClick={handleRemix}
        disabled={isLoading || !content.trim()}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? 'Generating Tweets...' : 'Generate Tweets'}
      </button>

      {error && (
        <div className="mt-4 p-2 text-red-600 border border-red-300 rounded">
          {error}
        </div>
      )}

      {tweets.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Generated Tweets</h2>
          <div className="space-y-4">
            {tweets.map((tweet, index) => (
              <div key={index} className="p-4 border rounded bg-white hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <p className="flex-grow">{tweet}</p>
                  <span className="text-sm text-gray-500 ml-2">
                    {tweet.length}/280
                  </span>
                </div>
                <div className="mt-2 flex justify-end">
                  <button 
                    onClick={() => navigator.clipboard.writeText(tweet)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App 