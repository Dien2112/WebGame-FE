import React, { useState, useContext, useEffect } from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { User, Trophy, Target, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const auth = useContext(AuthProvider);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial state from auth, but will be overwritten by fetch
  const [formData, setFormData] = useState({
    name: auth?.user?.name || '',
    bio: auth?.user?.bio || '',
    avatar: auth?.user?.avatar || '',
  });

  useEffect(() => {
    fetchProfile();
  }, [auth?.token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users/profile');
      if (res.user) {
        setProfileData(res.user);
        setFormData({
          name: res.user.username || '',
          bio: res.user.bio || '',
          avatar: res.user.avatar_url || ''
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const body = {
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar,
      };
      const data = await api.put('/api/users/profile', body);
      if (data.profile) {
        auth?.updateUser(data.profile);
        setProfileData(prev => ({ ...prev, ...data.profile })); // Update local state
        setIsEditing(false);
        // alert('Cập nhật hồ sơ thành công!'); 
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      // alert('Cập nhật hồ sơ thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#072D44] dark:text-white">Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <Card className="border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#D0D7E1' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-[#072D44] dark:text-white">
              <User className="w-5 h-5" style={{ color: '#5790AB' }} />
              <span>Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#0f3460] dark:text-white"
                    style={{ borderColor: '#D0D7E1', backgroundColor: 'white', color: '#072D44' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[#5790AB] dark:text-[#9CCDDB]">Name</p>
                    <p className="font-semibold text-[#072D44] dark:text-white">{profileData?.username || profileData?.name || 'User'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#5790AB] dark:text-[#9CCDDB]">Email</p>
                    <p className="font-semibold text-[#072D44] dark:text-white">{profileData?.email || profileData?.email || 'user@example.com'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#5790AB] dark:text-[#9CCDDB]">Bio</p>
                    <p className="text-[#072D44] dark:text-white">{profileData?.bio || 'No bio yet'}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>

                {/* Avatar Section */}
                <div className="flex-shrink-0 flex justify-center md:justify-end">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#5790AB]">
                    {(profileData?.avatar_url || profileData?.avatar) ? (
                      <img
                        src={profileData?.avatar_url || profileData?.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#5790AB] flex items-center justify-center text-white font-bold text-4xl">
                        {(profileData?.username || profileData?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Fallback for onError hidden by default */}
                    <div style={{ display: 'none' }} className="w-full h-full bg-[#5790AB] flex items-center justify-center text-white font-bold text-4xl">
                      {(profileData?.username || profileData?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#D0D7E1' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-[#072D44] dark:text-white">
              <Trophy className="w-5 h-5" style={{ color: '#5790AB' }} />
              <span>Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" style={{ color: '#5790AB' }} />
                <span className="text-[#072D44] dark:text-white">Total Games</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">{profileData?.total_games || profileData?.totalGames || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" style={{ color: '#5790AB' }} />
                <span className="text-[#072D44] dark:text-white">Wins</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">{profileData?.wins || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" style={{ color: '#9CCDDB' }} />
                <span className="text-[#072D44] dark:text-white">Losses</span>
              </div>
              {/* Note: Backend might not send losses directly if only total and wins are tracked, can infer */}
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">
                {(profileData?.totalGames || 0) - (profileData?.wins || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" style={{ color: '#5790AB' }} />
                <span className="text-[#072D44] dark:text-white">Win Rate</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">
                {(profileData?.totalGames || 0) > 0
                  ? Math.round(((profileData?.wins || 0) / (profileData?.totalGames || 1)) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
