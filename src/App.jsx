import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import SavedTweets from './components/SavedTweets'

function App() {
  const [content, setContent] = useState('')
  const [tweets, setTweets] = useState([])
  const [editableTweets, setEditableTweets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [refreshSavedTweets, setRefreshSavedTweets] = useState(0)

  useEffect(() => {
    setEditableTweets(tweets.map(tweet => ({ content: tweet, editing: false })))
  }, [tweets])

  const handleTweetEdit = (index, newContent) => {
    const newTweets = [...editableTweets]
    newTweets[index].content = newContent
    setEditableTweets(newTweets)
  }

  const toggleEditing = (index) => {
    const newTweets = [...editableTweets]
    newTweets[index].editing = !newTweets[index].editing
    setEditableTweets(newTweets)
  }

  const handleRemix = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Sending request to server with content:', content.substring(0, 50) + '...');
      
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() })
      });

      console.log('Response status:', response.status);
      
      // Try to read the response as text first
      const responseText = await response.text();
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      if (!data.tweets || !Array.isArray(data.tweets)) {
        throw new Error('Invalid response format from server');
      }
      
      setTweets(data.tweets);
    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  async function saveTweet(tweet) {
    try {
      const { error } = await supabase
        .from('saved_tweets')
        .insert([{ content: tweet }]);

      if (error) throw error;
      setRefreshSavedTweets(prev => prev + 1);
    } catch (error) {
      console.error('Error saving tweet:', error);
    }
  }

  function openTwitterShare(tweet) {
    const tweetText = encodeURIComponent(tweet);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 max-w-6xl mx-auto p-6">
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

        {editableTweets.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Generated Tweets</h2>
            <div className="grid grid-cols-2 gap-4">
              {editableTweets.map((tweet, index) => (
                <div key={index} className="p-4 border rounded bg-white hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    {tweet.editing ? (
                      <textarea
                        value={tweet.content}
                        onChange={(e) => handleTweetEdit(index, e.target.value)}
                        className="w-full p-2 border rounded"
                        rows="3"
                      />
                    ) : (
                      <p className="flex-grow">{tweet.content}</p>
                    )}
                    <span className="text-sm text-gray-500 ml-2">
                      {280 - tweet.content.length} chars left
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => toggleEditing(index)}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      {tweet.editing ? 'Save' : 'Edit'}
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(tweet.content)}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Copy
                    </button>
                    <button 
                      onClick={() => saveTweet(tweet.content)}
                      className="text-sm text-green-500 hover:text-green-600"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => openTwitterShare(tweet.content)}
                      className="text-sm bg-[#1DA1F2] text-white px-3 py-1 rounded-full hover:bg-[#1a8cd8] flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      <span>Tweet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <SavedTweets refreshTrigger={refreshSavedTweets} />
    </div>
  )
}

export default App 