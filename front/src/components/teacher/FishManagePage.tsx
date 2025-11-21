import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { get, post, put, del, getFullUrl } from '../../utils/api';

interface Fish {
  fish_id: number;
  fish_name: string;
  grade: 'COMMON' | 'RARE' | 'LEGENDARY';
  probability: number;
  image_url: string | null;
}

const GRADE_LABELS = {
  COMMON: '일반',
  RARE: '희귀',
  LEGENDARY: '전설'
};

const GRADE_COLORS = {
  COMMON: 'bg-gray-100 text-gray-800',
  RARE: 'bg-blue-100 text-blue-800',
  LEGENDARY: 'bg-yellow-100 text-yellow-800'
};

export function FishManagePage() {
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFish, setEditingFish] = useState<Fish | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [fishName, setFishName] = useState('');
  const [grade, setGrade] = useState<'COMMON' | 'RARE' | 'LEGENDARY'>('COMMON');
  const [probability, setProbability] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchFishList();
  }, []);

  const fetchFishList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get('/api/v1/fish');
      const json = await response.json();
      if (response.ok) {
        setFishList(json.data || []);
      } else {
        setError(json?.message || '물고기 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      setError('물고기 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadUrl = getFullUrl('/api/v1/files/upload');
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorJson = await response.json();
          throw new Error(errorJson?.message || '이미지 업로드 실패');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || '이미지 업로드 실패');
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        return json.data?.url || null;
      } else {
        const text = await response.text();
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('이미지 업로드 오류:', err);
      alert(`이미지 업로드 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDialog = (fish?: Fish) => {
    if (fish) {
      setEditingFish(fish);
      setFishName(fish.fish_name);
      setGrade(fish.grade);
      setProbability(fish.probability.toString());
      setImageUrl(fish.image_url || '');
      setImageFile(null);
      setImagePreview(fish.image_url || null);
    } else {
      setEditingFish(null);
      setFishName('');
      setGrade('COMMON');
      setProbability('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFish(null);
    setFishName('');
    setGrade('COMMON');
    setProbability('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!fishName.trim() || !probability.trim()) {
      alert('물고기 이름과 확률을 입력해주세요.');
      return;
    }

    const probValue = parseFloat(probability);
    if (isNaN(probValue) || probValue <= 0) {
      alert('확률은 0보다 큰 숫자여야 합니다.');
      return;
    }

    let finalImageUrl = imageUrl;

    // 파일이 있으면 업로드 시도
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        return; // 업로드 실패 시 중단
      }
    }

    try {
      const payload = {
        fish_name: fishName.trim(),
        grade: grade,
        probability: probValue,
        image_url: finalImageUrl || null
      };

      if (editingFish) {
        const response = await put(`/api/v1/fish/${editingFish.fish_id}`, payload);
        const json = await response.json();
        if (response.ok) {
          alert('물고기가 수정되었습니다.');
          fetchFishList();
          handleCloseDialog();
        } else {
          alert(json?.message || '물고기 수정에 실패했습니다.');
        }
      } else {
        const response = await post('/api/v1/fish', payload);
        const json = await response.json();
        if (response.ok) {
          alert('물고기가 생성되었습니다.');
          fetchFishList();
          handleCloseDialog();
        } else {
          alert(json?.message || '물고기 생성에 실패했습니다.');
        }
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleDelete = async (fishId: number) => {
    if (!confirm('정말 이 물고기를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await del(`/api/v1/fish/${fishId}`);
      const json = await response.json();
      if (response.ok) {
        alert('물고기가 삭제되었습니다.');
        fetchFishList();
      } else {
        alert(json?.message || '물고기 삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">물고기 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold">가챠 물고기 관리</h1>
          <p className="text-sm text-gray-600 mt-1">가챠에서 뽑을 수 있는 물고기를 관리합니다.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          물고기 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fishList.map((fish) => (
          <Card key={fish.fish_id} className="border-2 border-gray-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{fish.fish_name}</CardTitle>
                <Badge className={GRADE_COLORS[fish.grade]}>
                  {GRADE_LABELS[fish.grade]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {fish.image_url && (
                <div className="mb-3">
                  <img
                    src={fish.image_url}
                    alt={fish.fish_name}
                    className="w-full h-32 object-cover rounded border border-gray-300"
                  />
                </div>
              )}
              <div className="space-y-1 text-sm">
                <div>확률: {fish.probability}%</div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(fish)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(fish.fish_id)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFish ? '물고기 수정' : '물고기 추가'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">물고기 이름 *</label>
              <Input
                value={fishName}
                onChange={(e) => setFishName(e.target.value)}
                placeholder="물고기 이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">등급 *</label>
              <Select value={grade} onValueChange={(value: 'COMMON' | 'RARE' | 'LEGENDARY') => setGrade(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMMON">일반</SelectItem>
                  <SelectItem value="RARE">희귀</SelectItem>
                  <SelectItem value="LEGENDARY">전설</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">확률 (%) *</label>
              <Input
                type="number"
                step="0.01"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                placeholder="예: 10.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">이미지</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="flex-1"
                    disabled={uploading}
                  />
                  {imageFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {(imagePreview || imageUrl) && (
                  <div className="relative">
                    <img
                      src={imagePreview || imageUrl}
                      alt="미리보기"
                      className="w-full h-48 object-contain border border-gray-300 rounded"
                    />
                  </div>
                )}
                <div className="text-sm text-gray-500">또는</div>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="이미지 URL을 직접 입력하세요"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={uploading} className="bg-black text-white hover:bg-gray-800">
                {uploading ? '업로드 중...' : (editingFish ? '수정' : '추가')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

