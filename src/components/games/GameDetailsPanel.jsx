import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, MessageSquare, Clock } from 'lucide-react';

const GameDetailsPanel = ({ game, activeGameId, runtimeStats }) => {
    // game: The full game object from the list (including config)
    // activeGameId: 'SNAKE', 'TICTACTOE' etc.

    const [comments, setComments] = useState([]);
    const [stats, setStats] = useState({ avgRating: 0, total: 0 });
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (game?.id) {
            fetchComments(game.id);
        }
    }, [game?.id]);

    const fetchComments = async (gameId) => {
        try {
            setLoading(true);
            const data = await api.get(`/api/comments/${gameId}`);
            setComments(data.comments);
            setStats(data.stats);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !game?.id) return;

        try {
            // Assuming auth is handled or we use a hardcoded user for now (handled by BE controller fallback if no auth)
            // Ideally, we get user from context
            const payload = {
                content: newComment,
                rating: newRating,
            };

            const res = await api.post(`/api/comments/${game.id}`, payload);
            if (res) {
                setNewComment('');
                fetchComments(game.id);
            }
        } catch (error) {
            console.error("Failed to post comment", error);
        }
    };

    if (!game) {
        return (
            <div className="w-80 h-[600px] bg-white border-2 border-slate-200 rounded-xl p-6 flex items-center justify-center text-slate-400">
                <p>Select a game to view details</p>
            </div>
        );
    }

    return (
        <div className="w-80 h-[600px] bg-white border-2 border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-lg ml-6">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">{game.game}</h2>
                <div className="flex items-center text-yellow-500 font-bold space-x-2">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-lg">{stats.avgRating.toFixed(1)}</span>
                    <span className="text-xs text-slate-400 font-normal">({stats.total} reviews)</span>
                </div>

                {/* Runtime Stats Panel */}
                {(runtimeStats?.time > 0 || runtimeStats?.score > 0) && (
                    <div className="mt-4 p-3 bg-slate-800 rounded-lg text-white font-mono flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase">Time</span>
                            <span className="text-xl font-bold">{runtimeStats.time}s</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] text-slate-400 uppercase">Score</span>
                            <span className="text-xl font-bold text-green-400">{runtimeStats.score}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Rating Input */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Rate & Review</label>
                    <div className="flex items-center space-x-1 mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => setNewRating(star)}
                                className={`transition-colors ${star <= newRating ? 'text-yellow-400' : 'text-slate-300'}`}
                            >
                                <Star className="w-6 h-6 fill-current" />
                            </button>
                        ))}
                    </div>
                    <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-2 bg-white"
                    />
                    <Button size="sm" onClick={handlePostComment} className="w-full">
                        Post Review
                    </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Recent Comments
                    </h3>
                    {comments.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No comments yet. Be the first!</p>
                    ) : (
                        comments.map(c => (
                            <div key={c.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                            {c.avatar_url ? <img src={c.avatar_url} alt="av" /> : null}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{c.username || 'User'}</span>
                                    </div>
                                    <div className="flex text-yellow-400">
                                        {[...Array(c.rating)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameDetailsPanel;
