import { User } from "lucide-react";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function Avatar({ src, size = 'md', className = '', onClick }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  
  return (
    <div 
      className={`relative rounded-full bg-muted flex items-center justify-center overflow-hidden ${sizeClass} ${className}`}
      onClick={onClick}
    >
      {src ? (
        <Image
          src={src}
          alt="User avatar"
          fill
          className="object-cover"
        />
      ) : (
        <User className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
} 