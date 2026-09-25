export interface SamplePreset {
  id: string;
  title: string;
  overlayText: string;
  subtitle: string;
  images: string[];
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'cailin',
    title: 'Cailin Nữ Vương Thải Lân',
    overlayText: 'CAILIN',
    subtitle: '✦ MY QUEEN ✦',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80', // Fantasy art
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', // Portrait beauty
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80', // Queen portrait
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', // Close up face
    ],
  },
  {
    id: 'linger',
    title: "Ling'er Linh Nhi",
    overlayText: "LING'ER",
    subtitle: '✦ ICE DRAGON ✦',
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', // Blue fantasy
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', // Portrait
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', // Cyber fairy
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80', // Aesthetic face
    ],
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk Neon',
    overlayText: 'NEON VIBE',
    subtitle: '✦ TOKYO NIGHTS ✦',
    images: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    ],
  },
];
