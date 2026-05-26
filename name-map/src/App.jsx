import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useCircles } from './hooks/useCircles';
import { usePeople } from './hooks/usePeople';
import LoginPage from './components/Auth/LoginPage';
import NavBar from './components/shared/NavBar';
import MemoryTest from './components/Memory/MemoryTest';
import DirectoryView from './components/Directory/DirectoryView';
import AddPersonModal from './components/AddPerson/AddPersonModal';
import NetworkGraph from './components/Graph/NetworkGraph';

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return <div className="flex min-h-full items-center justify-center text-gray-500">Loading…</div>;
  }

  if (!session) return <LoginPage />;

  return <AuthedApp session={session} />;
}

function AuthedApp({ session }) {
  const { circles, byId } = useCircles(session);
  const { people, loading, create, bulkCreate, update, remove } = usePeople(session);

  const shared = { people, circles, byCircle: byId, onUpdate: update, onDelete: remove };

  return (
    <div className="min-h-full pb-16">
      <Header email={session.user.email} />
      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading your people…</div>
      ) : (
        <Routes>
          <Route path="/" element={<MemoryTest {...shared} />} />
          <Route path="/graph" element={<NetworkGraph {...shared} />} />
          <Route path="/directory" element={<DirectoryView {...shared} />} />
          <Route
            path="/add"
            element={
              <AddPersonModal
                session={session}
                circles={circles}
                people={people}
                onCreate={create}
                onBulkCreate={bulkCreate}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      <NavBar />
    </div>
  );
}

function Header({ email }) {
  return (
    <header className="flex items-center justify-between border-b border-edge px-4 py-2 text-xs text-gray-500">
      <span className="font-medium text-gray-300">NameMap</span>
      <button onClick={() => supabase.auth.signOut()} className="hover:text-gray-200">
        {email} · Sign out
      </button>
    </header>
  );
}
