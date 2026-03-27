import { useState } from "react";
import { votePoll } from "../services/api";
import { useAuth } from "../Context/AuthContext";

export default function PollCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [voting, setVoting] = useState(false);
  const poll = post.poll;
  if (!poll) return null;

  const totalVotes = poll.options.reduce((a, o) => a + (o.votes?.length || 0), 0);
  const userVoted  = poll.options.some(o => o.votes?.map(String).includes(String(user?._id)));
  const isEnded    = poll.endsAt && new Date() > new Date(poll.endsAt);

  const handleVote = async (idx) => {
    if (voting || userVoted || isEnded) return;
    setVoting(true);
    try {
      const r = await votePoll(post._id, idx);
      onUpdate?.({ ...post, poll: r.data });
    } catch (_) {}
    setVoting(false);
  };

  return (
    <div className="px-3 pb-3">
      <div className="bg-theme-input rounded-2xl p-4 border border-theme">
        <p className="font-semibold text-theme-primary text-sm mb-3">{poll.question}</p>
        <div className="space-y-2">
          {poll.options.map((opt, i) => {
            const pct = totalVotes > 0 ? Math.round((opt.votes?.length || 0) / totalVotes * 100) : 0;
            const myVote = opt.votes?.map(String).includes(String(user?._id));
            return (
              <button key={i} onClick={() => handleVote(i)} disabled={userVoted || isEnded || voting}
                className={`w-full relative rounded-xl overflow-hidden border-2 transition text-left
                  ${myVote ? "border-purple-500" : "border-theme hover:border-purple-400"}
                  ${(userVoted || isEnded) ? "cursor-default" : "cursor-pointer"}`}>
                {(userVoted || isEnded) && (
                  <div className="absolute inset-0 bg-purple-500/20 rounded-xl transition-all" style={{ width: `${pct}%` }}/>
                )}
                <div className="relative flex items-center justify-between px-3 py-2.5">
                  <span className={`text-sm font-medium ${myVote ? "text-purple-400" : "text-theme-primary"}`}>
                    {myVote && "✓ "}{opt.text}
                  </span>
                  {(userVoted || isEnded) && (
                    <span className="text-xs font-bold text-theme-muted">{pct}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-theme-muted">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
          {poll.endsAt && (
            <p className="text-xs text-theme-muted">
              {isEnded ? "Poll ended" : `Ends ${new Date(poll.endsAt).toLocaleDateString()}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
