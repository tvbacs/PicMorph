import { LayoutPreset } from '../types';

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'grid-2x2',
    name: '4 Ô 2x2',
    subtitle: 'Lưới 4 ô',
    slotsCount: 4,
    isFeatured: true,
    slots: [
      { id: 0, left: 0, top: 0, width: 50, height: 50 },
      { id: 1, left: 50, top: 0, width: 50, height: 50 },
      { id: 2, left: 0, top: 50, width: 50, height: 50 },
      { id: 3, left: 50, top: 50, width: 50, height: 50 },
    ],
  },
  {
    id: 'single-1',
    name: '1 Ô Đơn',
    subtitle: 'Toàn khung hình',
    slotsCount: 1,
    slots: [
      { id: 0, left: 0, top: 0, width: 100, height: 100 },
    ],
  },
  {
    id: 'grid-1x2',
    name: '2 Ô Dọc',
    subtitle: 'Trên & Dưới',
    slotsCount: 2,
    slots: [
      { id: 0, left: 0, top: 0, width: 100, height: 50 },
      { id: 1, left: 0, top: 50, width: 100, height: 50 },
    ],
  },
  {
    id: 'grid-2x1',
    name: '2 Ô Ngang',
    subtitle: 'Trái & Phải',
    slotsCount: 2,
    slots: [
      { id: 0, left: 0, top: 0, width: 50, height: 100 },
      { id: 1, left: 50, top: 0, width: 50, height: 100 },
    ],
  },
  {
    id: 'grid-1-2',
    name: '3 Ô 1 Trên 2 Dưới',
    subtitle: 'Nổi bật ảnh chính',
    slotsCount: 3,
    slots: [
      { id: 0, left: 0, top: 0, width: 100, height: 55 },
      { id: 1, left: 0, top: 55, width: 50, height: 45 },
      { id: 2, left: 50, top: 55, width: 50, height: 45 },
    ],
  },
  {
    id: 'grid-2-1',
    name: '3 Ô 2 Trên 1 Dưới',
    subtitle: 'Ảnh dưới trải rộng',
    slotsCount: 3,
    slots: [
      { id: 0, left: 0, top: 0, width: 50, height: 45 },
      { id: 1, left: 50, top: 0, width: 50, height: 45 },
      { id: 2, left: 0, top: 45, width: 100, height: 55 },
    ],
  },
  {
    id: 'grid-3-rows',
    name: '3 Dải Ngang',
    subtitle: 'Cinematic Movie Strip',
    slotsCount: 3,
    slots: [
      { id: 0, left: 0, top: 0, width: 100, height: 33.33 },
      { id: 1, left: 0, top: 33.33, width: 100, height: 33.33 },
      { id: 2, left: 0, top: 66.66, width: 100, height: 33.34 },
    ],
  },
  {
    id: 'grid-3-cols',
    name: '3 Cột Dọc',
    subtitle: 'Poster Triplet',
    slotsCount: 3,
    slots: [
      { id: 0, left: 0, top: 0, width: 33.33, height: 100 },
      { id: 1, left: 33.33, top: 0, width: 33.33, height: 100 },
      { id: 2, left: 66.66, top: 0, width: 33.34, height: 100 },
    ],
  },
  {
    id: 'grid-1-3',
    name: '4 Ô 1 Lớn 3 Nhỏ',
    subtitle: 'Tạp chí thời trang',
    slotsCount: 4,
    slots: [
      { id: 0, left: 0, top: 0, width: 65, height: 100 },
      { id: 1, left: 65, top: 0, width: 35, height: 33.33 },
      { id: 2, left: 65, top: 33.33, width: 35, height: 33.33 },
      { id: 3, left: 65, top: 66.66, width: 35, height: 33.34 },
    ],
  },
  {
    id: 'grid-6',
    name: '6 Ô 2x3',
    subtitle: 'Story Album 6 ảnh',
    slotsCount: 6,
    slots: [
      { id: 0, left: 0, top: 0, width: 50, height: 33.33 },
      { id: 1, left: 50, top: 0, width: 50, height: 33.33 },
      { id: 2, left: 0, top: 33.33, width: 50, height: 33.33 },
      { id: 3, left: 50, top: 33.33, width: 50, height: 33.33 },
      { id: 4, left: 0, top: 66.66, width: 50, height: 33.34 },
      { id: 5, left: 50, top: 66.66, width: 50, height: 33.34 },
    ],
  },
  {
    id: 'grid-9',
    name: '9 Ô 3x3',
    subtitle: 'Instagram Grid Mood',
    slotsCount: 9,
    slots: [
      { id: 0, left: 0, top: 0, width: 33.33, height: 33.33 },
      { id: 1, left: 33.33, top: 0, width: 33.33, height: 33.33 },
      { id: 2, left: 66.66, top: 0, width: 33.34, height: 33.33 },
      { id: 3, left: 0, top: 33.33, width: 33.33, height: 33.33 },
      { id: 4, left: 33.33, top: 33.33, width: 33.33, height: 33.33 },
      { id: 5, left: 66.66, top: 33.33, width: 33.34, height: 33.33 },
      { id: 6, left: 0, top: 66.66, width: 33.33, height: 33.34 },
      { id: 7, left: 33.33, top: 66.66, width: 33.33, height: 33.34 },
      { id: 8, left: 66.66, top: 66.66, width: 33.34, height: 33.34 },
    ],
  },
];
