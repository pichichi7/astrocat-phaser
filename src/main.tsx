/**
 * Devvit App Entry Point
 * Integrates Phaser game with Reddit via Custom Post + WebView
 */
import { Devvit, useState, useChannel, useInterval, useAsync } from '@devvit/public-api';

// Configure capabilities
Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true,
});

/**
 * Menu Action: Create Game Post
 */
Devvit.addMenuItem({
  label: '🎮 Create AstroCat Game Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    try {
      const post = await reddit.submitPost({
        title: '🐱 AstroCat - Q*bert Style Puzzle Game',
        subredditName: subreddit.name,
        preview: (
          <vstack height="100%" width="100%" alignment="middle center" gap="medium" padding="large">
            <image
              url="default-icon.png"
              description="AstroCat Logo"
              imageHeight={256}
              imageWidth={256}
            />
            <text size="xxlarge" weight="bold" color="white">
              🐱 AstroCat Space Puzzler
            </text>
            <text size="large" color="neutral-content">
              Q*bert meets space cats! Navigate isometric platforms, avoid enemies, collect stars.
            </text>
            <vstack gap="small" alignment="center">
              <text size="medium" color="neutral-content-weak">✨ Features:</text>
              <text size="small" color="neutral-content">🏆 Global Leaderboard</text>
              <text size="small" color="neutral-content">🌐 Share Custom Levels</text>
              <text size="small" color="neutral-content">🎮 Touch + Keyboard Controls</text>
              <text size="small" color="neutral-content">📱 Mobile Responsive</text>
            </vstack>
            <button appearance="primary" size="large">
              🚀 Play Game
            </button>
          </vstack>
        ),
      });

      ui.showToast({
        text: `Game post created! ${post.id}`,
        appearance: 'success',
      });
    } catch (error) {
      console.error('Failed to create post:', error);
      ui.showToast({
        text: 'Failed to create game post',
        appearance: 'error',
      });
    }
  },
});

/**
 * Custom Post Type - Main Game Experience
 */
Devvit.addCustomPostType({
  name: 'AstroCat Game',
  height: 'tall',
  render: (context) => {
    const { postId, redis, reddit, userId, ui } = context;

    // View state management
    const [currentView, setCurrentView] = useState<'game' | 'leaderboard' | 'browse' | 'share'>('game');
    const [levelToShare, setLevelToShare] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('Player');

    // Load username on mount
    useState(async () => {
      try {
        const user = await reddit.getCurrentUser();
        if (user) {
          setUsername(user.username);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    });

    // Load shared level data from Redis if this is a shared level post
    const { data: sharedLevelData, loading: levelDataLoading } = useAsync(async () => {
      try {
        console.log('[Devvit] 📦 Loading level data for post:', postId);
        
        // Try to get level data from Redis using post ID
        const levelDataStr = await redis.get(`level:${postId}`);
        
        if (levelDataStr) {
          console.log('[Devvit] ✅ Found level data in Redis');
          const parsedData = JSON.parse(levelDataStr);
          console.log('[Devvit] 📊 Level data:', parsedData);
          return parsedData;
        }
        
        console.log('[Devvit] ℹ️ No level data found for this post');
        return null;
      } catch (error) {
        console.error('[Devvit] ❌ Failed to load level data:', error);
        return null;
      }
    }, {
      depends: [postId],
    });

    // WebView communication channel
    const [webviewToBlock] = useChannel<{
      type: string;
      data: any;
    }>({
      name: 'game-channel',
      onMessage: async (msg) => {
        console.log('Received from WebView:', msg.type);

        try {
          switch (msg.type) {
            case 'SUBMIT_SCORE': {
              const { score, levelId, timeMs } = msg.data;
              
              if (!userId) {
                ui.showToast({ text: 'Login to save scores!', appearance: 'neutral' });
                return;
              }

              // Save to Redis via internal endpoint
              const key = levelId ? `leaderboard:level:${levelId}` : 'leaderboard:global';
              await redis.zAdd(key, {
                member: userId,
                score: score,
              });

              // Store user data
              await redis.hSet(`user:${userId}`, {
                username: username,
                bestScore: score.toString(),
                lastUpdated: Date.now().toString(),
              });

              ui.showToast({
                text: `🎉 Score ${score} saved!`,
                appearance: 'success',
              });
              
              console.log(`Score saved: ${username} - ${score}`);
              break;
            }

            case 'OPEN_LEADERBOARD': {
              setCurrentView('leaderboard');
              break;
            }

            case 'SHARE_LEVEL': {
              const { levelData } = msg.data;
              setLevelToShare(levelData);
              setCurrentView('share');
              break;
            }

            case 'BROWSE_LEVELS': {
              setCurrentView('browse');
              break;
            }

            case 'BACK_TO_GAME': {
              setCurrentView('game');
              break;
            }

            default:
              console.warn('Unknown message type:', msg.type);
          }
        } catch (error) {
          console.error('Error handling message:', error);
          ui.showToast({
            text: 'An error occurred',
            appearance: 'error',
          });
        }
      },
    });

    // Leaderboard View
    if (currentView === 'leaderboard') {
      return <LeaderboardView context={context} onClose={() => setCurrentView('game')} />;
    }

    // Browse Levels View
    if (currentView === 'browse') {
      return <BrowseLevelsView context={context} onClose={() => setCurrentView('game')} />;
    }

    // Share Level View
    if (currentView === 'share' && levelToShare) {
      return (
        <ShareLevelView
          context={context}
          levelData={levelToShare}
          onClose={() => setCurrentView('game')}
          onSuccess={() => {
            setCurrentView('browse');
            ui.showToast({ text: '🎉 Level shared to Reddit!', appearance: 'success' });
          }}
        />
      );
    }

    // Show loading while checking for level data
    if (levelDataLoading) {
      return (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large" color="white">Loading game...</text>
        </vstack>
      );
    }

    // Main Game View (WebView)
    return (
      <vstack height="100%" width="100%" alignment="top center">
        <vstack height="100%" width="100%" alignment="middle center">
          <webview
            id="game-webview"
            url="game.html"
            width="100%"
            height="100%"
            onMessage={(msg) => {
              console.log('[Devvit] 📨 Received message from WebView:', msg);
              
              // If game is ready and we have shared level data, send it
              if (msg.type === 'GAME_READY' && sharedLevelData) {
                console.log('[Devvit] → Sending shared level data to game');
                webviewToBlock.send({
                  type: 'INIT_DATA',
                  data: {
                    postData: { sharedLevelData }
                  }
                });
              } else {
                webviewToBlock.send(msg);
              }
            }}
          />
        </vstack>
      </vstack>
    );
  },
});

/**
 * Leaderboard View Component
 */
function LeaderboardView(props: { context: Devvit.Context; onClose: () => void }): JSX.Element {
  const { redis, userId } = props.context;

  const [topPlayers, setTopPlayers] = useState<Array<{ username: string; score: number; rank: number }>>([]);
  const [myRank, setMyRank] = useState<{ rank: number; score: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load leaderboard data
  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);

      // Get top 10 players
      const topScores = await redis.zRange('leaderboard:global', 0, 9, { reverse: true, by: 'rank' });
      
      const players = await Promise.all(
        topScores.map(async (entry, index) => {
          const userData = await redis.hGetAll(`user:${entry.member}`);
          return {
            username: userData.username || 'Anonymous',
            score: entry.score,
            rank: index + 1,
          };
        })
      );

      setTopPlayers(players);

      // Get current user's rank
      if (userId) {
        const userScore = await redis.zScore('leaderboard:global', userId);
        const userRank = await redis.zRank('leaderboard:global', userId);

        if (userScore !== undefined && userRank !== undefined) {
          setMyRank({
            rank: topScores.length - userRank,
            score: userScore,
          });
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setIsLoading(false);
    }
  };

  // Initial load
  useState(async () => {
    await loadLeaderboard();
  });

  // Auto-refresh every 5 seconds
  useInterval(async () => {
    await loadLeaderboard();
  }, 5000).start();

  return (
    <vstack height="100%" width="100%" alignment="top center" padding="medium" gap="medium">
      {/* Header */}
      <hstack width="100%" alignment="middle">
        <spacer grow />
        <text size="xxlarge" weight="bold" color="white">
          🏆 Global Leaderboard
        </text>
        <spacer grow />
        <button icon="close" size="small" onPress={props.onClose} />
      </hstack>

      {/* User's Rank Card */}
      {myRank && (
        <vstack
          width="100%"
          padding="medium"
          backgroundColor="rgba(0, 255, 255, 0.1)"
          borderColor="cyan"
          cornerRadius="medium"
          gap="small"
        >
          <text size="medium" color="cyan" weight="bold">
            Your Rank
          </text>
          <hstack alignment="middle" gap="medium">
            <text size="xlarge" color="white">
              #{myRank.rank}
            </text>
            <spacer grow />
            <text size="large" color="gold">
              {myRank.score} pts
            </text>
          </hstack>
        </vstack>
      )}

      {/* Top 10 List */}
      <vstack width="100%" gap="small" grow>
        {isLoading ? (
          <text size="large" color="neutral-content" alignment="center middle">
            Loading...
          </text>
        ) : topPlayers.length === 0 ? (
          <text size="large" color="neutral-content-weak" alignment="center middle">
            No scores yet. Be the first!
          </text>
        ) : (
          topPlayers.map((player) => {
            const medal = player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '';
            const isCurrentUser = myRank?.rank === player.rank;

            return (
              <hstack
                key={`player-${player.rank}`}
                width="100%"
                padding="small"
                backgroundColor={isCurrentUser ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)'}
                cornerRadius="small"
                alignment="middle"
                gap="medium"
              >
                <text size="medium" color="white" width="40px">
                  {medal || `#${player.rank}`}
                </text>
                <text size="medium" color="white" grow>
                  {player.username}
                </text>
                <text size="medium" color="gold" weight="bold">
                  {player.score}
                </text>
              </hstack>
            );
          })
        )}
      </vstack>

      {/* Footer */}
      <text size="small" color="neutral-content-weak" alignment="center">
        Updates every 5 seconds
      </text>

      <button appearance="primary" size="large" onPress={props.onClose}>
        ← Back to Game
      </button>
    </vstack>
  );
}

/**
 * Browse Levels View Component
 */
function BrowseLevelsView(props: { context: Devvit.Context; onClose: () => void }): JSX.Element {
  const { redis, ui } = props.context;

  const [levels, setLevels] = useState<Array<{
    id: string;
    name: string;
    creator: string;
    difficulty: string;
    playCount: number;
    rating: number;
    postUrl: string;
  }>>([]);
  const [filter, setFilter] = useState<'trending' | 'newest'>('trending');
  const [isLoading, setIsLoading] = useState(true);

  // Load levels from Redis
  const loadLevels = async () => {
    try {
      setIsLoading(true);

      const indexKey = filter === 'trending' ? 'shared_levels:trending' : 'shared_levels:all';
      const levelIds = await redis.zRange(indexKey, 0, 19, { reverse: true, by: 'rank' });

      const loadedLevels = await Promise.all(
        levelIds.map(async (entry) => {
          const levelData = await redis.hGetAll(`shared_level:${entry.member}`);
          return {
            id: entry.member.toString(),
            name: levelData.name || 'Unnamed Level',
            creator: levelData.creator || 'Anonymous',
            difficulty: levelData.difficulty || 'medium',
            playCount: parseInt(levelData.playCount || '0'),
            rating: parseFloat(levelData.averageRating || '0'),
            postUrl: levelData.postUrl || '',
          };
        })
      );

      setLevels(loadedLevels);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load levels:', error);
      setIsLoading(false);
    }
  };

  // Initial load
  useState(async () => {
    await loadLevels();
  });

  // Auto-refresh every 10 seconds
  useInterval(async () => {
    await loadLevels();
  }, 10000).start();

  // Handle play level
  const handlePlayLevel = async (levelId: string) => {
    try {
      // Increment play count
      await redis.hIncrBy(`shared_level:${levelId}`, 'playCount', 1);
      await redis.zIncrBy('shared_levels:trending', 1, levelId);

      // Send to WebView
      // Note: This would need channel communication back to WebView
      ui.showToast({ text: 'Loading level...', appearance: 'neutral' });

      // Close and return to game with level data
      props.onClose();
    } catch (error) {
      console.error('Failed to load level:', error);
      ui.showToast({ text: 'Failed to load level', appearance: 'error' });
    }
  };

  return (
    <vstack height="100%" width="100%" alignment="top center" padding="medium" gap="medium">
      {/* Header */}
      <hstack width="100%" alignment="middle">
        <spacer grow />
        <text size="xxlarge" weight="bold" color="white">
          🌐 Community Levels
        </text>
        <spacer grow />
        <button icon="close" size="small" onPress={props.onClose} />
      </hstack>

      {/* Filter Tabs */}
      <hstack width="100%" gap="small">
        <button
          appearance={filter === 'trending' ? 'primary' : 'secondary'}
          size="medium"
          onPress={() => setFilter('trending')}
          grow
        >
          🔥 Trending
        </button>
        <button
          appearance={filter === 'newest' ? 'primary' : 'secondary'}
          size="medium"
          onPress={() => setFilter('newest')}
          grow
        >
          🆕 Newest
        </button>
      </hstack>

      {/* Levels List */}
      <vstack width="100%" gap="small" grow>
        {isLoading ? (
          <text size="large" color="neutral-content" alignment="center middle">
            Loading levels...
          </text>
        ) : levels.length === 0 ? (
          <vstack alignment="center middle" gap="small">
            <text size="large" color="neutral-content-weak">
              No levels shared yet!
            </text>
            <text size="medium" color="neutral-content-weak">
              Create and share a level in the editor.
            </text>
          </vstack>
        ) : (
          levels.map((level) => {
            const diffColor = level.difficulty === 'easy' ? 'green' : level.difficulty === 'hard' ? 'red' : 'orange';

            return (
              <vstack
                key={`level-${level.id}`}
                width="100%"
                padding="medium"
                backgroundColor="rgba(22, 33, 62, 0.8)"
                borderColor="rgba(0, 255, 255, 0.3)"
                cornerRadius="small"
                gap="small"
              >
                <hstack width="100%" alignment="middle">
                  <text size="large" color="cyan" weight="bold" grow>
                    {level.name}
                  </text>
                  <text size="small" color={diffColor}>
                    {level.difficulty.toUpperCase()}
                  </text>
                </hstack>

                <text size="small" color="neutral-content">
                  by {level.creator}
                </text>

                <hstack width="100%" alignment="middle" gap="medium">
                  <text size="small" color="neutral-content-weak">
                    ▶️ {level.playCount} plays
                  </text>
                  {level.rating > 0 && (
                    <text size="small" color="gold">
                      ⭐ {level.rating.toFixed(1)}
                    </text>
                  )}
                  <spacer grow />
                  <button
                    appearance="success"
                    size="small"
                    onPress={() => handlePlayLevel(level.id)}
                  >
                    Play
                  </button>
                </hstack>
              </vstack>
            );
          })
        )}
      </vstack>

      {/* Footer */}
      <text size="small" color="neutral-content-weak" alignment="center">
        {levels.length} level{levels.length !== 1 ? 's' : ''} available
      </text>

      <button appearance="primary" size="large" onPress={props.onClose}>
        ← Back to Game
      </button>
    </vstack>
  );
}

/**
 * Share Level View Component
 */
function ShareLevelView(props: {
  context: Devvit.Context;
  levelData: string;
  onClose: () => void;
  onSuccess: () => void;
}): JSX.Element {
  const { redis, reddit, userId, ui } = props.context;

  const [levelName, setLevelName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!levelName.trim()) {
      ui.showToast({ text: 'Please enter a level name', appearance: 'neutral' });
      return;
    }

    if (!userId) {
      ui.showToast({ text: 'You must be logged in to share levels', appearance: 'neutral' });
      return;
    }

    try {
      setIsSharing(true);

      // Get username
      const user = await reddit.getCurrentUser();
      const username = user?.username || 'Anonymous';

      // 🔥 FIX: Call the backend API to create the post properly
      const response = await fetch('/api/share-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levelName: levelName,
          description: `A ${difficulty} difficulty level created by ${username}`,
          difficulty: difficulty,
          levelData: props.levelData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Level shared successfully!');
        console.log('   Post ID:', result.postId);
        console.log('   Level ID:', result.levelId);
        
        setIsSharing(false);
        ui.showToast({ text: '✅ Level shared to Reddit!', appearance: 'success' });
        props.onSuccess();
      } else {
        throw new Error(result.error || 'Failed to share level');
      }
    } catch (error) {
      console.error('❌ Failed to share level:', error);
      console.error('Error details:', error);
      setIsSharing(false);
      ui.showToast({ text: '❌ Failed to share level', appearance: 'neutral' });
    }
  };

  return (
    <vstack height="100%" width="100%" alignment="middle center" padding="large" gap="large">
      <text size="xxlarge" weight="bold" color="white">
        📤 Share Level to Reddit
      </text>

      <vstack width="100%" maxWidth="400px" gap="medium">
        {/* Level Name Input */}
        <vstack gap="small">
          <text size="medium" color="white">
            Level Name:
          </text>
          <textInput
            placeholder="Enter level name..."
            value={levelName}
            onChangeText={(text) => setLevelName(text)}
          />
        </vstack>

        {/* Difficulty Selection */}
        <vstack gap="small">
          <text size="medium" color="white">
            Difficulty:
          </text>
          <hstack gap="small">
            <button
              appearance={difficulty === 'easy' ? 'success' : 'secondary'}
              onPress={() => setDifficulty('easy')}
              grow
            >
              Easy
            </button>
            <button
              appearance={difficulty === 'medium' ? 'primary' : 'secondary'}
              onPress={() => setDifficulty('medium')}
              grow
            >
              Medium
            </button>
            <button
              appearance={difficulty === 'hard' ? 'destructive' : 'secondary'}
              onPress={() => setDifficulty('hard')}
              grow
            >
              Hard
            </button>
          </hstack>
        </vstack>

        {/* Action Buttons */}
        <vstack gap="small">
          <button
            appearance="primary"
            size="large"
            onPress={handleShare}
            disabled={isSharing || !levelName.trim()}
          >
            {isSharing ? '⏳ Sharing...' : '🚀 Share to Reddit'}
          </button>
          <button appearance="secondary" size="medium" onPress={props.onClose} disabled={isSharing}>
            Cancel
          </button>
        </vstack>
      </vstack>
    </vstack>
  );
}

export default Devvit;
