import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trophy, Award, Star, Medal, Gamepad2, Percent, Lock, CheckCircle, Target, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { GAMES, getStatsForGame, getUserAchievements } from '../../lib/mockRankingData';

const ITEMS_PER_PAGE = 5;

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGame, setSelectedGame] = useState('all');
  const [unlockedPage, setUnlockedPage] = useState(1);
  const [lockedPage, setLockedPage] = useState(1);

  // Get stats based on selected game
  const userStats = useMemo(() => {
    return getStatsForGame(selectedGame);
  }, [selectedGame]);

  // Calculate achievements based on selected game
  const allAchievements = useMemo(() => {
    return getUserAchievements(selectedGame);
  }, [selectedGame]);

  // Filter by category
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return allAchievements;
    return allAchievements.filter(a => a.category === selectedCategory);
  }, [allAchievements, selectedCategory]);

  // Separate unlocked and locked
  const unlockedAchievements = filteredAchievements.filter(a => a.unlocked);
  const lockedAchievements = filteredAchievements.filter(a => !a.unlocked);

  // Pagination for unlocked
  const totalUnlockedPages = Math.ceil(unlockedAchievements.length / ITEMS_PER_PAGE);
  const paginatedUnlocked = unlockedAchievements.slice(
    (unlockedPage - 1) * ITEMS_PER_PAGE,
    unlockedPage * ITEMS_PER_PAGE
  );

  // Pagination for locked
  const totalLockedPages = Math.ceil(lockedAchievements.length / ITEMS_PER_PAGE);
  const paginatedLocked = lockedAchievements.slice(
    (lockedPage - 1) * ITEMS_PER_PAGE,
    lockedPage * ITEMS_PER_PAGE
  );

  // Reset pages when filters change
  React.useEffect(() => {
    setUnlockedPage(1);
    setLockedPage(1);
  }, [selectedCategory, selectedGame]);

  const categories = [
    { id: 'all', label: 'All', icon: Award },
    { id: 'wins', label: 'Wins', icon: Trophy },
    { id: 'matches', label: 'Matches', icon: Gamepad2 },
    { id: 'winrate', label: 'Win Rate', icon: Percent },
    { id: 'score', label: 'Score', icon: Star }
  ];

  const getIcon = (iconType, unlocked = true) => {
    const colorClass = unlocked ? 'text-[#5790AB]' : 'text-[#9CCDDB]';
    const props = { className: `w-8 h-8 ${colorClass}` };
    
    switch (iconType) {
      case 'trophy':
        return <Trophy {...props} />;
      case 'star':
        return <Star {...props} />;
      case 'gamepad':
        return <Gamepad2 {...props} />;
      case 'percent':
        return <Percent {...props} />;
      case 'medal':
        return <Medal {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'wins': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'matches': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'winrate': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'score': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'wins': return 'Wins';
      case 'matches': return 'Matches';
      case 'winrate': return 'Win Rate';
      case 'score': return 'Score';
      default: return '';
    }
  };

  const getGameLabel = (gameId) => {
    const game = GAMES.find(g => g.id === gameId);
    return game ? game.name : gameId;
  };

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D0D7E1] dark:hover:bg-[#0f3460] text-[#5790AB]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-[#5790AB] dark:text-[#9CCDDB]">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D0D7E1] dark:hover:bg-[#0f3460] text-[#5790AB]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // Achievement Card component
  const AchievementCard = ({ achievement, isLocked = false, showGameTag = false }) => (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isLocked 
        ? 'bg-[#F8F9FA] dark:bg-[#0f3460]/50 border-[#D0D7E1] dark:border-[#16213e] opacity-75' 
        : 'bg-white dark:bg-[#16213e] border-[#5790AB] hover:shadow-md'
    }`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 p-3 rounded-xl ${
          isLocked 
            ? 'bg-[#D0D7E1]/50 dark:bg-[#16213e]' 
            : 'bg-[#5790AB]/10 dark:bg-[#5790AB]/20'
        }`}>
          {getIcon(achievement.icon, !isLocked)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold ${
              isLocked 
                ? 'text-[#5790AB] dark:text-[#9CCDDB]' 
                : 'text-[#072D44] dark:text-white'
            }`}>
              {achievement.title}
            </h3>
            {isLocked ? (
              <Lock className="w-4 h-4 text-[#9CCDDB]" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-sm mb-2 text-[#5790AB] dark:text-[#9CCDDB]">
            {achievement.description}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(achievement.category)}`}>
                {getCategoryLabel(achievement.category)}
              </span>
              {showGameTag && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#072D44]/10 text-[#072D44] dark:bg-[#5790AB]/20 dark:text-[#9CCDDB]">
                  {achievement.game === 'all' ? 'Global' : getGameLabel(achievement.game)}
                </span>
              )}
            </div>
            {isLocked ? (
              <span className="text-xs text-[#9CCDDB] dark:text-[#5790AB]">
                {achievement.progress.toFixed(0)}%
              </span>
            ) : (
              <span className="text-xs text-[#9CCDDB] dark:text-[#5790AB]">
                {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString('en-US')}
              </span>
            )}
          </div>
          {/* Progress bar for locked achievements */}
          {isLocked && (
            <div className="mt-2 h-1.5 bg-[#D0D7E1] dark:bg-[#16213e] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5790AB]/50 rounded-full transition-all"
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#072D44] dark:text-white">Achievements</h2>
          <p className="text-[#5790AB] dark:text-[#9CCDDB] mt-1">
            Complete challenges to unlock achievements
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-[#F8F9FA] dark:bg-[#0f3460] px-4 py-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-[#072D44] dark:text-white">
              {unlockedAchievements.length}/{filteredAchievements.length}
            </span>
            <span className="text-sm text-[#5790AB] dark:text-[#9CCDDB]">unlocked</span>
          </div>
        </div>
      </div>

      {/* User Stats Card */}
      <Card className="border-2 bg-gradient-to-r from-[#5790AB]/10 to-[#9CCDDB]/10 dark:from-[#0f3460] dark:to-[#16213e]" style={{ borderColor: '#5790AB' }}>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Gamepad2 className="w-6 h-6 text-[#5790AB]" />
              </div>
              <p className="text-2xl font-bold text-[#072D44] dark:text-white">{userStats.total_games}</p>
              <p className="text-sm text-[#5790AB] dark:text-[#9CCDDB]">Matches</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-[#072D44] dark:text-white">{userStats.wins}</p>
              <p className="text-sm text-[#5790AB] dark:text-[#9CCDDB]">Wins</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Percent className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-[#072D44] dark:text-white">{userStats.winRate?.toFixed(1) || 0}%</p>
              <p className="text-sm text-[#5790AB] dark:text-[#9CCDDB]">Win Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-[#072D44] dark:text-white">{userStats.total_score?.toLocaleString() || 0}</p>
              <p className="text-sm text-[#5790AB] dark:text-[#9CCDDB]">Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Row - Game Dropdown + Category Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Game Dropdown */}
        <div className="relative">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="appearance-none bg-white dark:bg-[#16213e] border-2 border-[#D0D7E1] dark:border-[#0f3460] rounded-lg px-4 py-2 pr-10 text-[#5790AB] dark:text-[#9CCDDB] font-medium cursor-pointer hover:border-[#5790AB] focus:border-[#5790AB] focus:outline-none transition-colors"
          >
            {GAMES.map(game => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5790AB] pointer-events-none" />
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#5790AB] text-white'
                    : 'bg-[#F8F9FA] dark:bg-[#0f3460] text-[#5790AB] dark:text-[#9CCDDB] hover:bg-[#D0D7E1] dark:hover:bg-[#16213e]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unlocked Achievements Section */}
      <Card className="border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#5790AB' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-[#072D44] dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Unlocked Achievements ({unlockedAchievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedUnlocked.length > 0 ? (
            <div className="space-y-3">
              {paginatedUnlocked.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} showGameTag={selectedGame === 'all'} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-[#9CCDDB]" />
              <p className="text-[#5790AB] dark:text-[#9CCDDB]">
                No achievements unlocked yet
              </p>
            </div>
          )}
          <Pagination 
            currentPage={unlockedPage} 
            totalPages={totalUnlockedPages} 
            onPageChange={setUnlockedPage} 
          />
        </CardContent>
      </Card>

      {/* Locked Achievements Section */}
      <Card className="border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#D0D7E1' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-[#072D44] dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#9CCDDB]" />
            Locked Achievements ({lockedAchievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedLocked.length > 0 ? (
            <div className="space-y-3">
              {paginatedLocked.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} isLocked showGameTag={selectedGame === 'all'} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p className="text-[#5790AB] dark:text-[#9CCDDB]">
                You have unlocked all achievements! 🎉
              </p>
            </div>
          )}
          <Pagination 
            currentPage={lockedPage} 
            totalPages={totalLockedPages} 
            onPageChange={setLockedPage} 
          />
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card className="border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#D0D7E1' }}>
        <CardHeader>
          <CardTitle className="text-[#072D44] dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#5790AB]" />
            Progress by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['wins', 'matches', 'winrate', 'score'].map(category => {
              const categoryAchievements = allAchievements.filter(a => a.category === category);
              const unlockedCount = categoryAchievements.filter(a => a.unlocked).length;
              const totalCount = categoryAchievements.length;
              const percentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#072D44] dark:text-white">
                      {getCategoryLabel(category)}
                    </span>
                    <span className="text-sm text-[#5790AB] dark:text-[#9CCDDB]">
                      {unlockedCount}/{totalCount}
                    </span>
                  </div>
                  <div className="h-2 bg-[#D0D7E1] dark:bg-[#0f3460] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#5790AB] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
