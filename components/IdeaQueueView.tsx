import React, { useMemo } from 'react';
import { Idea, WorkflowStatus, User } from '../types';
import { WORKFLOW_STAGES, STATUS_COLORS } from '../constants';
import { SearchIcon, FilterIcon, ClearIcon, SortAscIcon, SortDescIcon } from './icons';

interface IdeaQueueViewProps {
  ideas: Idea[];
  allIdeas: Idea[];
  onUpdateStatus: (ideaId: string, newStatus: WorkflowStatus) => void;
  onClaimIdea: (ideaId: string, claimantEmail: string) => void;
  onCardClick: (idea: Idea) => void;
  currentUser: User;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: { status: string; claimedBy: string; dateFrom: string; dateTo: string };
  setFilters: (filters: { status: string; claimedBy: string; dateFrom: string; dateTo: string }) => void;
  sortConfig: { key: keyof Idea | 'submitter'; direction: 'ascending' | 'descending' };
  setSortConfig: (config: { key: keyof Idea | 'submitter'; direction: 'ascending' | 'descending' }) => void;
}

const selectStyles = "bg-base-800 border border-base-700 rounded-md shadow-sm p-2 text-sm text-base-content focus:ring-brand-primary focus:border-brand-primary";
const inputStyles = "bg-base-800 border border-base-700 rounded-md shadow-sm p-2 text-sm text-base-content focus:ring-brand-primary focus:border-brand-primary";

const IdeaQueueView: React.FC<IdeaQueueViewProps> = (props) => {
  const { 
    ideas, allIdeas, onUpdateStatus, onClaimIdea, onCardClick, currentUser,
    searchTerm, setSearchTerm, filters, setFilters, sortConfig, setSortConfig
  } = props;

  const uniqueClaimants = useMemo(() => {
    const claimants = new Set(allIdeas.map(idea => idea.claimedBy).filter(Boolean));
    return Array.from(claimants) as string[];
  }, [allIdeas]);

  const handleSort = (key: keyof Idea | 'submitter') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const clearFilters = () => {
    setFilters({ status: '', claimedBy: '', dateFrom: '', dateTo: '' });
    setSearchTerm('');
  };

  const Th: React.FC<{ sortKey: keyof Idea | 'submitter'; children: React.ReactNode }> = ({ sortKey, children }) => (
    <th className="p-3 text-left text-xs font-semibold text-base-content-secondary uppercase tracking-wider">
      <button onClick={() => handleSort(sortKey)} className="flex items-center gap-1 group">
        <span>{children}</span>
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />
        )}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          {sortConfig.key !== sortKey && <SortAscIcon />}
        </span>
      </button>
    </th>
  );

  return (
    <div className="bg-base-800 border border-base-700 rounded-xl flex flex-col h-full animate-fade-in">
      {/* Controls: Search, Filter, Sort */}
      <div className="p-4 border-b border-base-700">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-grow min-w-[200px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-base-content-secondary">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by keyword, name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputStyles} w-full pl-10`}
            />
          </div>
          {/* Filters */}
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className={selectStyles}>
            <option value="">All Statuses</option>
            {WORKFLOW_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.claimedBy} onChange={e => setFilters({...filters, claimedBy: e.target.value})} className={selectStyles}>
            <option value="">All Claimants</option>
            {uniqueClaimants.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className={inputStyles} />
          <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className={inputStyles} />

          <button onClick={clearFilters} className="flex items-center gap-2 bg-base-700 hover:bg-base-600 text-base-content-secondary font-semibold py-2 px-3 rounded-md text-sm transition-colors">
            <ClearIcon /> Clear
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="flex-grow overflow-auto">
        <table className="min-w-full divide-y divide-base-700">
          <thead className="bg-base-800 sticky top-0">
            <tr>
              <Th sortKey="id">ID</Th>
              <Th sortKey="context">Idea</Th>
              <Th sortKey="submitter">Submitter</Th>
              <Th sortKey="status">Status</Th>
              <Th sortKey="claimedBy">Claimed By</Th>
              <Th sortKey="dateTime">Submitted Date</Th>
              <th className="p-3 text-left text-xs font-semibold text-base-content-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-base-800/50 divide-y divide-base-700">
            {ideas.map(idea => {
              const statusColor = STATUS_COLORS[idea.status] || { base: 'bg-slate-500/10', text: 'text-slate-400' };
              return (
                <tr 
                  key={idea.id} 
                  onClick={() => onCardClick(idea)}
                  className="hover:bg-base-700/50 cursor-pointer transition-colors"
                >
                  <td className="p-3 whitespace-nowrap text-sm font-mono text-base-content-secondary">{idea.id}</td>
                  <td className="p-3 max-w-sm">
                    <p className="font-semibold text-base-content truncate">{idea.context}</p>
                    <p className="text-xs text-base-content-secondary truncate">{idea.department}</p>
                  </td>
                  <td className="p-3 whitespace-nowrap text-sm text-base-content">{idea.employeeName}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColor.base} ${statusColor.text}`}>
                      {idea.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-sm text-base-content">{idea.claimedBy || 'N/A'}</td>
                  <td className="p-3 whitespace-nowrap text-sm text-base-content-secondary">{new Date(idea.dateTime).toLocaleDateString()}</td>
                  <td className="p-3 whitespace-nowrap text-xs space-x-2">
                    {idea.status === WorkflowStatus.New && (
                      <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(idea.id, WorkflowStatus.Reviewing);}} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold py-1 px-3 rounded-md">Review</button>
                    )}
                    {idea.status === WorkflowStatus.Reviewing && (
                      <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(idea.id, WorkflowStatus.Approved);}} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-1 px-3 rounded-md">Approve</button>
                    )}
                    {idea.status === WorkflowStatus.Approved && !idea.claimedBy && (
                      <button onClick={(e) => { e.stopPropagation(); onClaimIdea(idea.id, currentUser.email);}} className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold py-1 px-3 rounded-md">Claim</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
         {ideas.length === 0 && (
            <div className="text-center p-10 text-base-content-secondary">
                <p className="font-semibold">No ideas match your criteria.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default IdeaQueueView;