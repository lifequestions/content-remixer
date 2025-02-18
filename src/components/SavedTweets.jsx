import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SavedTweets({ refreshTrigger }) {
  const [savedTweets, setSavedTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    fetchSavedTweets();
  }, [refreshTrigger]);

  async function fetchSavedTweets() {
    try {
      console.log('Fetching saved tweets...');
      const { data, error } = await supabase
        .from('saved_tweets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched tweets:', data);
      setSavedTweets(data || []);
    } catch (error) {
      console.error('Error fetching saved tweets:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTweet(id) {
    try {
      const { error } = await supabase
        .from('saved_tweets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSavedTweets(savedTweets.filter(tweet => tweet.id !== id));
    } catch (error) {
      console.error('Error deleting tweet:', error);
      alert('Failed to delete tweet');
    }
  }

  function openTwitterShare(tweet) {
    const tweetText = encodeURIComponent(tweet);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  if (loading) return (
    <div className="h-screen w-80 bg-white border-l border-gray-200 p-4">
      Loading saved tweets...
    </div>
  );

  if (error) return (
    <div className="h-screen w-80 bg-white border-l border-gray-200 p-4">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <div className={`h-screen bg-white border-l border-gray-200 transition-all duration-300 ${isExpanded ? 'w-80' : 'w-12'}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2 w-full flex items-center justify-center hover:bg-gray-100"
      >
        {isExpanded ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>
      {isExpanded && (
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 40px)' }}>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Saved Tweets</h2>
            {savedTweets.length === 0 ? (
              <p className="text-gray-500">No saved tweets yet</p>
            ) : (
              <div className="space-y-4">
                {savedTweets.map((tweet) => (
                  <div key={tweet.id} className="p-4 border rounded-lg bg-gray-50">
                    <p className="mb-2">{tweet.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(tweet.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(tweet.content)}
                          className="text-sm text-blue-500 hover:text-blue-600"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => deleteTweet(tweet.id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => openTwitterShare(tweet.content)}
                          className="text-sm bg-[#1DA1F2] text-white px-3 py-1 rounded-full hover:bg-[#1a8cd8] flex items-center space-x-1"
                        >
                          <svg 
                            className="w-4 h-4" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          <span>Tweet</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 