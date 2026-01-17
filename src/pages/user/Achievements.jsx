import React, { useState, useEffect, useContext } from 'react';
import {AuthProvider} from '../../context/AuthContext';
import { projectId } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trophy, Award, Star, Medal } from 'lucide-react';

export default function Achievements() {
  const auth = useContext(AuthProvider);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2f44b6f3/achievements`,
        {
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.achievements) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'first_win':
        return <Trophy className="w-8 h-8" style={{ color: '#5790AB' }} />;
      case 'high_score':
        return <Star className="w-8 h-8" style={{ color: '#5790AB' }} />;
      case 'games_played':
        return <Medal className="w-8 h-8" style={{ color: '#064469' }} />;
      default:
        return <Award className="w-8 h-8" style={{ color: '#5790AB' }} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#072D44] dark:text-white">Thành tựu</h2>
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5" style={{ color: '#5790AB' }} />
          <span className="font-semibold text-[#072D44] dark:text-white">
            {achievements.length} thành tựu
          </span>
        </div>
      </div>

      {achievements.length === 0 ? (
        <Card className="border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#D0D7E1' }}>
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CCDDB' }} />
            <p className="text-lg text-[#5790AB] dark:text-[#9CCDDB]">
              Bạn chưa mở khóa thành tựu nào
            </p>
            <p className="text-sm mt-2 text-[#9CCDDB] dark:text-[#5790AB]">
              Chơi game để nhận thành tựu!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#D0D7E1' }}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getIcon(achievement.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 font-semibold text-[#072D44] dark:text-white">
                      {achievement.title}
                    </h3>
                    <p className="text-sm mb-2 text-[#5790AB] dark:text-[#9CCDDB]">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-[#9CCDDB] dark:text-[#5790AB]">
                      Mở khóa: {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Locked Achievements */}
      <Card className="border-2 bg-white dark:bg-[#16213e]" style={{ borderColor: '#D0D7E1' }}>
        <CardHeader>
          <CardTitle className="text-[#072D44] dark:text-white">Thành tựu có thể mở khóa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!achievements.some(a => a.type === 'first_win') && (
              <div className="p-4 rounded-lg opacity-60 bg-[#F8F9FA] dark:bg-[#0f3460]">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-6 h-6" style={{ color: '#9CCDDB' }} />
                  <div>
                    <p className="text-sm font-medium text-[#072D44] dark:text-white">Chiến thắng đầu tiên</p>
                    <p className="text-xs text-[#5790AB] dark:text-[#9CCDDB]">Thắng trận đầu tiên</p>
                  </div>
                </div>
              </div>
            )}
            {!achievements.some(a => a.type === 'high_score') && (
              <div className="p-4 rounded-lg opacity-60 bg-[#F8F9FA] dark:bg-[#0f3460]">
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6" style={{ color: '#9CCDDB' }} />
                  <div>
                    <p className="text-sm font-medium text-[#072D44] dark:text-white">Chuyên gia</p>
                    <p className="text-xs text-[#5790AB] dark:text-[#9CCDDB]">Đạt hơn 1000 điểm</p>
                  </div>
                </div>
              </div>
            )}
            {!achievements.some(a => a.type === 'games_played') && (
              <div className="p-4 rounded-lg opacity-60 bg-[#F8F9FA] dark:bg-[#0f3460]">
                <div className="flex items-center space-x-3">
                  <Medal className="w-6 h-6" style={{ color: '#9CCDDB' }} />
                  <div>
                    <p className="text-sm font-medium text-[#072D44] dark:text-white">Người chơi tận tụy</p>
                    <p className="text-xs text-[#5790AB] dark:text-[#9CCDDB]">Chơi 10 trận</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
