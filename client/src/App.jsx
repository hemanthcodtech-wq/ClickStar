import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import ProfileView from './components/ProfileView';
import LeaderboardView from './components/LeaderboardView';
import AdminPanel from './components/AdminPanel';
import SearchView from './components/SearchView';
import PostDetailModal from './components/PostDetailModal';
import NotificationsModal from './components/NotificationsModal';
import StarsInfoModal from './components/StarsInfoModal';
import StoriesTray, { DEFAULT_SEED_STORIES } from './components/StoriesTray';
import { CreateStoryModal } from './components/CreateStoryModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { HashtagView } from './components/HashtagView';
import { DesktopRightRail } from './components/DesktopRightRail';
import SplashScreen from './components/SplashScreen';
import LoginView from './components/LoginView';
import { PostSkeleton } from './components/PostSkeleton';
import FollowRequestsView from './components/FollowRequestsView';
import logoImg from './assets/logo.png';
import { useUser } from './context/UserContext';
import { useFeed } from './hooks/useFeed';
import { cacheGet, cacheSet } from './utils/pageCache';
import { Sparkles, PlusCircle, Heart } from 'lucide-react';

// Wrapper component to extract :username from URL route
const ProfileRouteWrapper = ({ onSelectPost, onNavigateAdmin }) => {
  const { username } = useParams();
  const { currentUser } = useUser();
  return (
    <ProfileView 
      username={username || currentUser?.username} 
      onSelectPost={onSelectPost}
      onNavigateAdmin={onNavigateAdmin}
    />
  );
};

// Wrapper component to extract :tag from URL route
const HashtagRouteWrapper = ({ onSelectPost }) => {
  const { tag } = useParams();
  const navigate = useNavigate();
  return (
    <HashtagView 
      tag={tag} 
      onBack={() => navigate('/')} 
      onSelectPost={onSelectPost} 
    />
  );
};

export function App() {
  const { currentUser, loadingAuth } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Show splash only on cold boot, not on reload
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('clickstar_splash_shown');
  });

  const [selectedPost, setSelectedPost] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStarsModalOpen, setIsStarsModalOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);

  // Manage Story Groups State & Views
  const [storyGroups, setStoryGroups] = useState(() => cacheGet('stories_groups') || DEFAULT_SEED_STORIES);

  // Load backend stories
  const fetchStories = async () => {
    try {
      const res = await fetch(`/api/stories?userId=${currentUser?.id || ''}`);
      const d = await res.json();
      if (d.success && Array.isArray(d.data) && d.data.length > 0) {
        setStoryGroups(d.data);
        cacheSet('stories_groups', d.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchStories();
    }
  }, [currentUser?.id]);

  // High-performance Stale-While-Revalidate cached feed hook
  const { 
    posts, 
    setPosts, 
    loading: loadingPosts, 
    refetch: fetchPosts,
    addPostOptimistic 
  } = useFeed(currentUser?.id);

  // Map current location to activeTab for Sidebar highlight
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'feed';
    if (path.startsWith('/search')) return 'search';
    if (path.startsWith('/leaderboard')) return 'leaderboard';
    if (path.startsWith('/create-post')) return 'create';
    if (path.startsWith('/story') || path.startsWith('/create-story')) return 'story';
    if (path.startsWith('/profile') || path.startsWith('/u/')) return 'profile';
    if (path.startsWith('/admin')) return 'admin';
    return 'feed';
  };

  const activeTab = getActiveTab();

  const handlePostCreated = (newPost) => {
    addPostOptimistic(newPost);
    navigate('/');
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleHashtagClick = (tag) => {
    const clean = tag.replace(/^#/, '');
    navigate(`/tag/${clean}`);
  };

  // 1. Show Splash screen only on initial cold boot
  if (showSplash) {
    return (
      <SplashScreen 
        onFinish={() => {
          sessionStorage.setItem('clickstar_splash_shown', 'true');
          setShowSplash(false);
        }} 
      />
    );
  }

  // 2. If checking token/auth in localStorage
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 3. If no user or token in localStorage, show full Login / Signup page
  if (!currentUser) {
    return <LoginView />;
  }

  // 4. Admin Panel direct full-screen Route: http://localhost:5173/admin
  if (location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <AdminPanel onExitToFeed={() => navigate('/')} />
      </div>
    );
  }

  // 5. Authenticated App Layout with standard separate URL routes
  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col md:flex-row overflow-hidden">
      
      {/* Desktop-only Navigation Sidebar - Linked directly to URLs */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'feed') navigate('/');
          else if (tab === 'search') navigate('/search');
          else if (tab === 'leaderboard') navigate('/leaderboard');
          else if (tab === 'profile') navigate(`/profile/${currentUser?.username}`);
          else if (tab === 'admin') navigate('/admin');
          else if (tab === 'create') navigate('/create-post');
        }} 
        onOpenCreate={() => navigate('/create-post')}
      />

      {/* Main Content Area - Scrollable independently */}
      <main className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden">
        
        {/* Top bar on mobile */}
        <header className="md:hidden sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-[#262626] px-4 py-2.5 flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-lg blur-xs opacity-50" />
              <img src={logoImg} alt="ClickStar" className="relative w-7 h-7 rounded-lg object-contain" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              ClickStar
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsStarsModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold active:scale-95 transition cursor-pointer hover:bg-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentUser?.stars_count || 0}</span>
            </button>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="p-1.5 text-zinc-300 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 active:scale-95 transition relative"
            >
              <Heart className="w-5 h-5 text-rose-500" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-black" />
            </button>
            <button 
              onClick={() => navigate('/create-post')}
              className="p-1.5 text-zinc-300 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 active:scale-95 transition"
            >
              <PlusCircle className="w-5 h-5 text-rose-500" />
            </button>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <div className="pb-24 md:pb-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 32,
                mass: 0.8,
              }}
              className="w-full"
            >
              <Routes location={location}>
                
                {/* 1. Feed Page: http://localhost:5173/ */}
                <Route path="/" element={
                  <div className="py-4 md:py-6 px-3 sm:px-4">
                    <StoriesTray 
                      onOpenCreate={() => navigate('/story/create')}
                      onSelectStoryIndex={(idx) => setSelectedStoryIndex(idx)}
                      storyGroups={storyGroups}
                      setStoryGroups={setStoryGroups}
                    />

                    <div className="max-w-[480px] mx-auto mb-6 flex items-center justify-between">
                      <h1 className="text-xl font-bold tracking-tight">For You</h1>
                      <button
                        onClick={() => setIsStarsModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold cursor-pointer hover:bg-amber-500/20 transition active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{currentUser?.stars_count || 0} Stars</span>
                      </button>
                    </div>

                    {loadingPosts ? (
                      <div className="max-w-[480px] mx-auto space-y-4">
                        <PostSkeleton />
                        <PostSkeleton />
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="text-center py-20 max-w-sm mx-auto">
                        <p className="text-zinc-400 text-sm mb-4">No posts in the feed yet.</p>
                        <button 
                          onClick={() => navigate('/create-post')}
                          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl text-xs font-semibold"
                        >
                          Create the first post
                        </button>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <PostCard 
                          key={post.id} 
                          post={post} 
                          onUserClick={handleUserClick}
                          onPostUpdated={fetchPosts}
                          onHashtagClick={handleHashtagClick}
                        />
                      ))
                    )}
                  </div>
                } />

                {/* 2. Search Page: http://localhost:5173/search */}
                <Route path="/search" element={
                  <SearchView 
                    onSelectUser={handleUserClick}
                    onSelectPost={(post) => setSelectedPost(post)}
                    onSelectHashtag={handleHashtagClick}
                  />
                } />

                {/* 3. Leaderboard Page: http://localhost:5173/leaderboard */}
                <Route path="/leaderboard" element={
                  <LeaderboardView onSelectUser={handleUserClick} />
                } />

                {/* 4. Create Post Dedicated Page: http://localhost:5173/create-post */}
                <Route path="/create-post" element={
                  <div className="py-6 px-4">
                    <CreatePostModal 
                      isOpen={true}
                      onClose={() => navigate('/')}
                      onPostCreated={handlePostCreated}
                    />
                  </div>
                } />

                {/* 5. Create Story Dedicated Page: http://localhost:5173/story/create or /story */}
                <Route path="/story" element={
                  <div className="py-6 px-4">
                    <CreateStoryModal
                      isOpen={true}
                      onClose={() => navigate('/')}
                      onStoryCreated={() => {
                        fetchStories();
                        navigate('/');
                      }}
                    />
                  </div>
                } />
                <Route path="/story/create" element={
                  <div className="py-6 px-4">
                    <CreateStoryModal
                      isOpen={true}
                      onClose={() => navigate('/')}
                      onStoryCreated={() => {
                        fetchStories();
                        navigate('/');
                      }}
                    />
                  </div>
                } />

                {/* 6. Profile Separate Routes: http://localhost:5173/profile and /profile/:username */}
                <Route path="/profile" element={
                  <ProfileRouteWrapper 
                    onSelectPost={(post) => setSelectedPost(post)}
                    onNavigateAdmin={() => navigate('/admin')}
                  />
                } />
                <Route path="/profile/:username" element={
                  <ProfileRouteWrapper 
                    onSelectPost={(post) => setSelectedPost(post)}
                    onNavigateAdmin={() => navigate('/admin')}
                  />
                } />

                {/* 7. Hashtag Route: http://localhost:5173/tag/:tag */}
                <Route path="/tag/:tag" element={
                  <HashtagRouteWrapper onSelectPost={(post) => setSelectedPost(post)} />
                } />

                {/* 8. Follow Requests Route: http://localhost:5173/requests */}
                <Route path="/requests" element={
                  <FollowRequestsView 
                    onUserClick={handleUserClick} 
                    onBack={() => navigate(-1)} 
                  />
                } />

                {/* Catch-all redirect to home feed */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Desktop Right Rail (Only on Feed view) */}
      {location.pathname === '/' && (
        <DesktopRightRail 
          onSelectUser={handleUserClick}
          onNavigateTab={(tab) => {
            if (tab === 'search') navigate('/search');
            else if (tab === 'leaderboard') navigate('/leaderboard');
          }}
          onOpenStarsInfo={() => setIsStarsModalOpen(true)}
        />
      )}

      {/* Post Detail & Comments Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onPostDeleted={() => {
          fetchPosts();
          setSelectedPost(null);
        }}
        onUserClick={handleUserClick}
      />

      {/* Notifications Drawer */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUserClick={handleUserClick}
        onSelectPost={(post) => setSelectedPost(post)}
        onOpenRequests={() => navigate('/requests')}
      />

      {/* Stars Reward Info Modal */}
      <StarsInfoModal
        isOpen={isStarsModalOpen}
        onClose={() => setIsStarsModalOpen(false)}
        onGoToLeaderboard={() => navigate('/leaderboard')}
      />

      {/* Fullscreen Instagram-style Story Viewer */}
      <StoryViewerModal
        isOpen={selectedStoryIndex !== null}
        onClose={() => setSelectedStoryIndex(null)}
        allStoryGroups={storyGroups}
        initialGroupIndex={selectedStoryIndex !== null ? selectedStoryIndex : 0}
        onStoryViewed={(storyId, groupId) => {
          setStoryGroups(prev => {
            const updated = prev.map(g => {
              if ((g.userId || g.id) === groupId) {
                return { ...g, hasUnseen: false };
              }
              return g;
            });
            cacheSet('stories_groups', updated);
            return updated;
          });

          fetch(`/api/stories/${storyId}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser?.id }),
          }).catch(console.error);
        }}
      />

      {/* Mobile Bottom Navigation Bar - Linked to Routes */}
      <MobileBottomNav 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'feed') navigate('/');
          else if (tab === 'search') navigate('/search');
          else if (tab === 'leaderboard') navigate('/leaderboard');
          else if (tab === 'profile') navigate(`/profile/${currentUser?.username}`);
          else if (tab === 'create') navigate('/create-post');
        }}
        onOpenCreate={() => navigate('/create-post')}
      />
    </div>
  );
}

export default App;
