import React, { useState, useMemo, useEffect, useReducer, useCallback } from 'react';
import { Idea, Note, WorkflowStatus, User } from './types';
import IdeaQueueView from './components/IdeaQueueView';
import IdeaModal from './components/IdeaModal';
import TaskDetailPage from './components/TaskDetailPage';
import { LogoIcon, PersonIcon, PlusIcon } from './components/icons';

// --- State Management using useReducer ---

type Action =
  | { type: 'SET_IDEAS'; payload: Idea[] }
  | { type: 'ADD_IDEA'; payload: Omit<Idea, 'id' | 'status' | 'notes'> }
  | { type: 'UPDATE_IDEA'; payload: Idea }
  | { type: 'UPDATE_STATUS'; payload: { ideaId: string; newStatus: WorkflowStatus } }
  | { type: 'CLAIM_IDEA'; payload: { ideaId: string; claimantEmail: string } };

function ideasReducer(state: Idea[], action: Action): Idea[] {
  switch (action.type) {
    case 'SET_IDEAS':
      return action.payload;
    case 'ADD_IDEA': {
      const newIdea: Idea = {
        ...action.payload,
        id: `INNV8-${Date.now()}`,
        status: WorkflowStatus.New,
        notes: [],
      };
      return [...state, newIdea];
    }
    case 'UPDATE_IDEA': {
      return state.map(idea =>
        idea.id === action.payload.id ? action.payload : idea
      );
    }
    case 'UPDATE_STATUS': {
      const { ideaId, newStatus } = action.payload;
      return state.map(idea => {
        if (idea.id === ideaId) {
          const updatedIdea = { ...idea, status: newStatus };
          if (newStatus === WorkflowStatus.Approved || newStatus === WorkflowStatus.New) {
            updatedIdea.claimedBy = undefined;
          }
          return updatedIdea;
        }
        return idea;
      });
    }
    case 'CLAIM_IDEA': {
      const { ideaId, claimantEmail } = action.payload;
      const ideaIndex = state.findIndex(
        (idea) =>
          idea.id === ideaId &&
          idea.status === WorkflowStatus.Approved &&
          !idea.claimedBy
      );

      if (ideaIndex === -1) {
        return state;
      }

      const newState = [...state];
      const updatedIdea = {
        ...newState[ideaIndex],
        status: WorkflowStatus.Claimed,
        claimedBy: claimantEmail,
      };
      newState[ideaIndex] = updatedIdea;

      return newState;
    }
    default:
      return state;
  }
}

const getInitialState = (): Idea[] => {
  try {
    const savedIdeas = localStorage.getItem('innov8-ideas');
    if (savedIdeas) {
      return JSON.parse(savedIdeas);
    }
  } catch (error) {
    console.error("Failed to parse ideas from localStorage", error);
  }
  // Return a default set of ideas if none are in localStorage
  return [
    { id: `INNV8-${Date.now() + 1}`, dateTime: new Date(Date.now() - 86400000 * 3).toISOString(), employeeName: 'Alice Johnson', employeeEmail: 'alice@example.com', managerEmail: 'manager@example.com', department: 'Engineering', context: 'Develop a new CI/CD pipeline for faster deployments.', status: WorkflowStatus.New, claimedBy: undefined, notes: [] },
    { id: `INNV8-${Date.now() + 2}`, dateTime: new Date(Date.now() - 86400000 * 2).toISOString(), employeeName: 'Bob Williams', employeeEmail: 'bob@example.com', managerEmail: 'manager@example.com', department: 'Marketing', context: 'Launch a social media campaign for the new feature.', status: WorkflowStatus.Approved, claimedBy: undefined, notes: [] },
    { id: `INNV8-${Date.now() + 3}`, dateTime: new Date(Date.now() - 86400000).toISOString(), employeeName: 'Charlie Brown', employeeEmail: 'charlie@example.com', managerEmail: 'manager@example.com', department: 'Sales', context: 'Automate lead scoring process in CRM.', status: WorkflowStatus.Claimed, claimedBy: 'diana@example.com', notes: [] },
    { id: `INNV8-${Date.now() + 4}`, dateTime: new Date().toISOString(), employeeName: 'Diana Prince', employeeEmail: 'diana@example.com', managerEmail: 'manager@example.com', department: 'Engineering', context: 'Refactor the authentication module to support SSO.', status: WorkflowStatus.InProgress, claimedBy: 'diana@example.com', notes: [{id: 'note-1', author: 'diana@example.com', content: 'Initial discovery phase complete. Starting on the OAuth implementation.', timestamp: new Date().toISOString()}] },
    { id: `INNV8-${Date.now() + 5}`, dateTime: new Date(Date.now() - 86400000 * 5).toISOString(), employeeName: 'Ethan Hunt', employeeEmail: 'ethan@example.com', managerEmail: 'manager@example.com', department: 'QA', context: 'Implement end-to-end automated testing for the checkout flow.', status: WorkflowStatus.Testing, claimedBy: 'frank@example.com', notes: [] },
  ];
};

interface AppProps {
  currentUser: User;
  onLogout: () => void;
}

const App: React.FC<AppProps> = ({ currentUser, onLogout }) => {
  const [ideas, dispatch] = useReducer(ideasReducer, getInitialState());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [viewingIdeaId, setViewingIdeaId] = useState<string | null>(null);
  
  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '', claimedBy: '', dateFrom: '', dateTo: '' });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Idea | 'submitter'; direction: 'ascending' | 'descending' }>({ key: 'dateTime', direction: 'descending' });

  useEffect(() => {
    localStorage.setItem('innov8-ideas', JSON.stringify(ideas));
  }, [ideas]);

  const filteredAndSortedIdeas = useMemo(() => {
    let filteredIdeas = ideas.filter(idea => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      // Search logic
      const matchesSearch = searchTerm === '' ||
        idea.context.toLowerCase().includes(lowerCaseSearchTerm) ||
        idea.employeeName.toLowerCase().includes(lowerCaseSearchTerm) ||
        idea.department.toLowerCase().includes(lowerCaseSearchTerm) ||
        idea.id.toLowerCase().includes(lowerCaseSearchTerm);

      // Filter logic
      const matchesStatus = filters.status === '' || idea.status === filters.status;
      const matchesClaimedBy = filters.claimedBy === '' || idea.claimedBy === filters.claimedBy;
      const ideaDate = new Date(idea.dateTime);
      const matchesDateFrom = filters.dateFrom === '' || ideaDate >= new Date(filters.dateFrom);
      const matchesDateTo = filters.dateTo === '' || ideaDate <= new Date(filters.dateTo);

      return matchesSearch && matchesStatus && matchesClaimedBy && matchesDateFrom && matchesDateTo;
    });

    // Sort logic
    return filteredIdeas.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'submitter') {
        aValue = a.employeeName;
        bValue = b.employeeName;
      } else {
        aValue = a[sortConfig.key as keyof Idea];
        bValue = b[sortConfig.key as keyof Idea];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

  }, [ideas, searchTerm, filters, sortConfig]);

  const handleAddIdea = useCallback((idea: Omit<Idea, 'id' | 'status' | 'notes'>) => {
    dispatch({ type: 'ADD_IDEA', payload: idea });
  }, []);

  const handleUpdateIdea = useCallback((updatedIdea: Idea) => {
    dispatch({ type: 'UPDATE_IDEA', payload: updatedIdea });
  }, []);
  
  const handleUpdateIdeaStatus = useCallback((ideaId: string, newStatus: WorkflowStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { ideaId, newStatus } });
  }, []);

  const handleClaimIdea = useCallback((ideaId: string, claimantEmail: string) => {
    dispatch({ type: 'CLAIM_IDEA', payload: { ideaId, claimantEmail } });
  }, []);

  const handleCardClick = (idea: Idea) => {
    const postClaimStatuses = [
      WorkflowStatus.Claimed,
      WorkflowStatus.InProgress,
      WorkflowStatus.Testing,
      WorkflowStatus.Deployed,
      WorkflowStatus.Resolved
    ];
    if (postClaimStatuses.includes(idea.status)) {
      setViewingIdeaId(idea.id);
    } else {
      setEditingIdea(idea);
      setIsModalOpen(true);
    }
  };
  
  const openModalForNew = () => {
    setEditingIdea(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIdea(null);
  };

  const viewingIdea = useMemo(() => ideas.find(idea => idea.id === viewingIdeaId), [ideas, viewingIdeaId]);

  if (viewingIdea) {
    return <TaskDetailPage 
              idea={viewingIdea} 
              onUpdate={handleUpdateIdea} 
              onBack={() => setViewingIdeaId(null)}
              currentUser={currentUser}
           />;
  }

  return (
    <div className="min-h-screen bg-base-900 text-base-content flex flex-col">
      <header className="p-4 bg-base-900/80 border-b border-base-700 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <h1 className="text-xl font-bold text-base-content">Innov8 Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm bg-base-800/50 px-3 py-2 rounded-full">
            <PersonIcon />
            <span className="font-medium">{currentUser.email}</span>
          </div>
          <button
            onClick={openModalForNew}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105"
          >
            <PlusIcon />
            <span>Submit Idea</span>
          </button>
          <button
            onClick={onLogout}
            className="bg-base-700 hover:bg-base-600 text-base-content-secondary font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 lg:p-6 overflow-x-auto">
        <IdeaQueueView
          ideas={filteredAndSortedIdeas}
          allIdeas={ideas} // for populating filter dropdowns
          onUpdateStatus={handleUpdateIdeaStatus} 
          onClaimIdea={handleClaimIdea}
          onCardClick={handleCardClick}
          currentUser={currentUser}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
        />
      </main>

      {isModalOpen && (
        <IdeaModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={editingIdea ? handleUpdateIdea : handleAddIdea}
          idea={editingIdea}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default App;