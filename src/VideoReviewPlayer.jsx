import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  MessageSquare,
  Check,
  X,
} from "lucide-react";

// Mock data for initial comments
const mockComments = [
  {
    id: "c_1",
    time: 12.324,
    author: "Alice",
    text: "Colour in background looks warm",
    resolved: false,
  },
  {
    id: "c_2",
    time: 45.678,
    author: "Bob",
    text: "Audio levels seem a bit low here",
    resolved: true,
  },
];

const VideoReviewPlayer = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comments, setComments] = useState(mockComments);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState({ author: "", text: "" });

  // Format time to HH:MM:SS.ms
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(3, "0")}`;
  };

  // Video event handlers
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newTime = clickPosition * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const stepFrame = (direction) => {
    if (videoRef.current && !isPlaying) {
      const frameRate = 30; // Assuming 30fps
      const frameTime = 1 / frameRate;
      const newTime = Math.max(
        0,
        Math.min(duration, currentTime + direction * frameTime)
      );
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const seekBy = (seconds) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Comment handlers
  const addComment = () => {
    if (newComment.author.trim() && newComment.text.trim()) {
      const comment = {
        id: `c_${Date.now()}`,
        time: currentTime,
        author: newComment.author.trim(),
        text: newComment.text.trim(),
        resolved: false,
      };
      setComments((prev) => [...prev, comment].sort((a, b) => a.time - b.time));
      setNewComment({ author: "", text: "" });
      setShowCommentForm(false);
    }
  };

  const toggleCommentResolved = (commentId) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, resolved: !comment.resolved }
          : comment
      )
    );
  };

  const jumpToComment = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(5);
          break;
        case "KeyC":
          e.preventDefault();
          setShowCommentForm(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, currentTime, duration]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Video Review Player</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              crossOrigin="anonymous"
            >
              <source
                src="https://storage.googleapis.com/sohonet-interview-video-sample-public/1040056094289814902/manifests/master_stage_3.m3u8"
                type="application/x-mpegURL"
              />
              Your browser does not support the video tag.
            </video>

            {/* Video Controls */}
            <div className="p-4 bg-gray-800">
              <div className="flex items-center space-x-4 mb-3">
                <button
                  onClick={togglePlayPause}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                  onClick={() => stepFrame(-1)}
                  disabled={isPlaying}
                  className="p-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded transition-colors"
                  title="Previous Frame"
                >
                  <SkipBack size={16} />
                </button>

                <button
                  onClick={() => stepFrame(1)}
                  disabled={isPlaying}
                  className="p-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded transition-colors"
                  title="Next Frame"
                >
                  <SkipForward size={16} />
                </button>

                <div className="text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                <button
                  onClick={() => setShowCommentForm(true)}
                  className="ml-auto flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                >
                  <MessageSquare size={16} />
                  <span>Add Comment</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div
                className="w-full h-2 bg-gray-600 rounded-full cursor-pointer relative"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
                {/* Comment markers */}
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="absolute top-0 w-1 h-2 bg-yellow-400 cursor-pointer"
                    style={{ left: `${(comment.time / duration) * 100}%` }}
                    title={`${comment.author}: ${comment.text}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToComment(comment.time);
                    }}
                  />
                ))}
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Shortcuts: Space (play/pause), ←/→ (seek ±5s), C (add comment)
              </div>
            </div>
          </div>
        </div>

        {/* Comments Panel */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Comments</h2>
            <span className="text-sm text-gray-400">
              {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Add Comment Form */}
          {showCommentForm && (
            <div className="mb-4 p-3 bg-gray-700 rounded">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={newComment.author}
                  onChange={(e) =>
                    setNewComment((prev) => ({
                      ...prev,
                      author: e.target.value,
                    }))
                  }
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400"
                />
              </div>
              <div className="mb-2">
                <textarea
                  placeholder="Add your comment..."
                  value={newComment.text}
                  onChange={(e) =>
                    setNewComment((prev) => ({ ...prev, text: e.target.value }))
                  }
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
              </div>
              <div className="text-xs text-gray-400 mb-3">
                Time: {formatTime(currentTime)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={addComment}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  Add Comment
                </button>
                <button
                  onClick={() => {
                    setShowCommentForm(false);
                    setNewComment({ author: "", text: "" });
                  }}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded border-l-4 cursor-pointer transition-all hover:bg-gray-700 ${
                  comment.resolved
                    ? "bg-gray-750 border-green-500 opacity-75"
                    : "bg-gray-700 border-blue-500"
                }`}
                onClick={() => jumpToComment(comment.time)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm">
                    <span className="font-medium text-blue-400">
                      {comment.author}
                    </span>
                    <span className="text-gray-400 ml-2 font-mono">
                      {formatTime(comment.time)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCommentResolved(comment.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      comment.resolved
                        ? "text-green-400 hover:text-green-300"
                        : "text-gray-400 hover:text-green-400"
                    }`}
                    title={
                      comment.resolved
                        ? "Mark as unresolved"
                        : "Mark as resolved"
                    }
                  >
                    {comment.resolved ? <Check size={16} /> : <X size={16} />}
                  </button>
                </div>
                <p className="text-sm text-gray-200">{comment.text}</p>
                {comment.resolved && (
                  <div className="text-xs text-green-400 mt-1">✓ Resolved</div>
                )}
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No comments yet. Click "Add Comment" to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoReviewPlayer;
