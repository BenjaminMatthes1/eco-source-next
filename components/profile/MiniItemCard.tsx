// components/profile/MiniItemCard.tsx
import CircularScore from '@/components/ui/circularScore';

interface CardProps {
  name: string;
  description: string;
  score?: number;
  onClick?: () => void;      // ← add here
}

export default function MiniItemCard({ name, description, score, onClick }: CardProps) {
  return (
    <div
      className="p-4 bg-white border rounded shadow hover:shadow-lg cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold mb-1">{name}</h3>
      <p className="text-xs font-redditLight flex-1 line-clamp-3">{description}</p>
      {score !== undefined && (
        <div className="mt-3 self-end">
          <CircularScore score={score} size={60} stroke={6} />
        </div>
      )}
    </div>
  );
}