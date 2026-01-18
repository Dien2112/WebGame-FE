import React, { useState, useContext } from 'react';
import {AuthProvider} from '../../context/AuthContext';
import { projectId } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { User, Trophy, Target, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const auth = useContext(AuthProvider);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: auth?.user?.name || '',
    bio: auth?.user?.bio || '',
    avatar: auth?.user?.avatar || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2f44b6f3/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth?.accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.profile) {
        auth?.updateUser(data.profile);
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
                  <p className="font-semibold text-[#072D44] dark:text-white">{auth?.user?.name || 'chu'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#5790AB] dark:text-[#9CCDDB]">Email</p>
                  <p className="font-semibold text-[#072D44] dark:text-white">{auth?.user?.email || 'user@example.com'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#5790AB] dark:text-[#9CCDDB]">Giới thiệu</p>
                  <p className="text-[#072D44] dark:text-white">{auth?.user?.bio || 'Chưa có giới thiệu'}</p>
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
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">{auth?.user?.totalGames || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" style={{ color: '#5790AB' }} />
                <span className="text-[#072D44] dark:text-white">Thắng</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">{auth?.user?.wins || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" style={{ color: '#9CCDDB' }} />
                <span className="text-[#072D44] dark:text-white">Thua</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">{auth?.user?.losses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" style={{ color: '#5790AB' }} />
                <span className="text-[#072D44] dark:text-white">Tỷ lệ thắng</span>
              </div>
              <span className="font-semibold text-[#064469] dark:text-[#9CCDDB]">
                {auth?.user?.totalGames
                  ? Math.round(((auth?.user?.wins || 0) / auth.user.totalGames) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>  
  );
}
