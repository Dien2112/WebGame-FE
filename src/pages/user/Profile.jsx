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
    bio: auth?.user?.bio || '', // Note: Auth context might not have bio initially if not updated
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
        // Also update auth context if needed? 
        // auth.updateUser(res.user); // Optional, keeps context fresh
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
      body = {
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar,
      };
      const response = await api.put('/api/users/profile', body);

      const data = await response.json();
      if (data.profile) {
        auth?.updateUser(data.profile);
        setProfileData(prev => ({ ...prev, ...data.profile })); // Update local state
        setIsEditing(false);
        alert('Cập nhật hồ sơ thành công!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Cập nhật hồ sơ thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#072D44] dark:text-white">Hồ sơ cá nhân</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <Card className="border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#D0D7E1' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-[#072D44] dark:text-white">
              <User className="w-5 h-5" style={{ color: '#5790AB' }} />
              <span>Thông tin</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên hiển thị</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu</Label>
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
                  <Button type="submit">Lưu</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Hủy
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#5790AB] dark:text-[#9CCDDB]">Tên</p>
                  <p className="font-semibold text-[#072D44] dark:text-white">{profileData?.username || auth?.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#5790AB] dark:text-[#9CCDDB]">Email</p>
                  <p className="font-semibold text-[#072D44] dark:text-white">{profileData?.email || auth?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#5790AB] dark:text-[#9CCDDB]">Giới thiệu</p>
                  <p className="text-[#072D44] dark:text-white">{profileData?.bio || 'Chưa có giới thiệu'}</p>
                </div>
                <Button onClick={() => setIsEditing(true)}>Chỉnh sửa hồ sơ</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#D0D7E1' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-[#072D44] dark:text-white">
              <Trophy className="w-5 h-5" style={{ color: '#5790AB' }} />
              <span>Thống kê</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" style={{ color: '#5790AB' }} />
                <span className="text-[#072D44] dark:text-white">Tổng số trận</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">{profileData?.totalGames || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" style={{ color: '#5790AB' }} />
                <span className="text-[#072D44] dark:text-white">Thắng</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">{profileData?.wins || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" style={{ color: '#9CCDDB' }} />
                <span className="text-[#072D44] dark:text-white">Thua</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">{profileData?.losses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" style={{ color: '#5790AB' }} />
                <span className="text-[#072D44] dark:text-white">Tỷ lệ thắng</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">
                {profileData?.totalGames
                  ? Math.round(((profileData?.wins || 0) / profileData.totalGames) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
