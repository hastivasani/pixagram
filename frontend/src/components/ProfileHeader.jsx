export default function ProfileHeader({ user, postCount = 0, onEditClick = () => {}, onFollowersClick = () => {}, onFollowingClick = () => {} }) {
  const followersCount = Array.isArray(user.followers) ? user.followers.length : (user.followers || 0);
  const followingCount = Array.isArray(user.following) ? user.following.length : (user.following || 0);

  return (
    <div className="mb-4">
      {/* Instagram-style: avatar left, stats right */}
      <div className="flex items-center gap-4 sm:gap-8 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
              alt={user.username}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white dark:border-gray-900"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          {/* Username row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-semibold text-theme-primary truncate">{user.username}</h2>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 sm:gap-6">
            {[
              ["Posts",     postCount,      null],
              ["Followers", followersCount, onFollowersClick],
              ["Following", followingCount, onFollowingClick],
            ].map(([label, val, onClick]) => (
              <button
                key={label}
                onClick={onClick || undefined}
                className="flex flex-col items-center sm:items-start"
              >
                <span className="text-sm sm:text-base font-bold text-theme-primary">{Number(val).toLocaleString()}</span>
                <span className="text-[11px] text-theme-muted">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Name + bio */}
      {user.name && <p className="text-[13px] font-semibold text-theme-primary mb-0.5">{user.name}</p>}
      {user.bio  && <p className="text-[13px] text-theme-secondary leading-snug mb-1 whitespace-pre-wrap">{user.bio}</p>}
      {user.website && (
        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-[13px] text-blue-500 hover:underline">
          {user.website}
        </a>
      )}

      {/* Edit button */}
      <button
        onClick={onEditClick}
        className="mt-3 w-full py-1.5 text-[13px] font-semibold bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-hover transition"
      >
        Edit profile
      </button>
    </div>
  );
}
