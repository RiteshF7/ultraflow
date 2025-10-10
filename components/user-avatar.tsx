import { AvatarProps } from '@radix-ui/react-avatar';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';

interface UserAvatarProps extends AvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ user, size = 'md', ...props }: UserAvatarProps) {
  if (!user) {
    return (
      <Avatar {...props}>
        <AvatarFallback>
          <Icons.user className="size-4" />
        </AvatarFallback>
      </Avatar>
    );
  }

  const sizeClasses = {
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-10'
  };

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Avatar className={sizeClasses[size]} {...props}>
      {avatarUrl ? (
        <AvatarImage alt={name} src={avatarUrl} />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{name}</span>
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
