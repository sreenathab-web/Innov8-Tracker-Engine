import React, { useState } from 'react';
import { Idea, WorkflowStatus, Note, User } from '../types';
import { WORKFLOW_STAGES, STATUS_COLORS } from '../constants';
import { BackIcon, CalendarIcon, PaperclipIcon, PersonIcon, PlusIcon, ActivityIcon, IdeaIcon } from './icons';

interface TaskDetailPageProps {
  idea: Idea;
  onUpdate: (updatedIdea: Idea) => void;
  onBack: () => void;
  currentUser: User;
}

const DetailItem: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-base-content-secondary mb-1">{label}</h4>
        {value && <p className="text-base-content bg-base-700/50 p-3 rounded-md break-words">{value}</p>}
        {children && <div className="text-base-content bg-base-700/50 p-3 rounded-md">{children}</div>}
    </div>
);

const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ idea, onUpdate, onBack, currentUser }) => {
    const [newNote, setNewNote] = useState('');
    const [currentStatus, setCurrentStatus] = useState(idea.status);
    
    const isDirty = currentStatus !== idea.status;
    const canEdit = currentUser.email === idea.claimedBy;

    const handleSave = () => {
        if (!canEdit) return;
        onUpdate({ ...idea, status: currentStatus });
    };

    const handleAddNote = () => {
        if (newNote.trim() === '' || !canEdit) return;

        const note: Note = {
            id: `note-${Date.now()}`,
            author: currentUser.email,
            content: newNote,
            timestamp: new Date().toISOString(),
        };
        const updatedNotes = [...(idea.notes || []), note];
        onUpdate({ ...idea, notes: updatedNotes });
        setNewNote('');
    };

  const statusColorInfo = STATUS_COLORS[currentStatus] || { base: 'bg-slate-500/10', text: 'text-slate-400' };

  return (
    <div className="min-h-screen bg-base-900 text-base-content flex flex-col animate-fade-in">
        <header className="p-4 bg-base-900/80 border-b border-base-700 backdrop-blur-sm flex items-center sticky top-0 z-20">
            <button onClick={onBack} className="flex items-center gap-2 text-base-content-secondary hover:text-base-content transition-colors mr-4 p-2 rounded-md hover:bg-base-700">
                <BackIcon />
                <span className="font-semibold">Back to Board</span>
            </button>
        </header>

        <main className="flex-grow p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-base-800 rounded-lg p-6 border border-base-700">
                    <div className="flex justify-between items-start gap-4">
                         <div className="flex-grow">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="text-brand-secondary"><IdeaIcon /></span>
                                <span className="font-mono text-sm bg-base-700 px-2 py-1 rounded-md text-base-content-secondary">{idea.id}</span>
                             </div>
                            <h2 className="text-3xl font-bold text-base-content">{idea.context}</h2>
                         </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <select
                                value={currentStatus}
                                onChange={(e) => setCurrentStatus(e.target.value as WorkflowStatus)}
                                disabled={!canEdit}
                                className={`bg-base-700 text-base-content font-bold py-2 pl-3 pr-8 rounded-lg border-2 border-transparent transition-colors ${statusColorInfo.text} focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {WORKFLOW_STAGES.map(status => (
                                    <option key={status} value={status} className="bg-base-800 font-medium">{status}</option>
                                ))}
                            </select>
                            {isDirty && canEdit && (
                                 <button 
                                    onClick={handleSave}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-base-800 p-6 rounded-lg border border-base-700">
                    {!canEdit && <p className="text-amber-400 bg-amber-500/10 p-3 rounded-md text-sm mb-6">Only the user who claimed this task ({idea.claimedBy}) can change the status or add notes.</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem label="Submitted By" value={`${idea.employeeName} (${idea.employeeEmail})`} />
                        <DetailItem label="Claimed By" value={idea.claimedBy || 'N/A'} />
                        <DetailItem label="Department" value={idea.department} />
                        <DetailItem label="Submission Date">
                            <div className="flex items-center gap-2">
                                <CalendarIcon />
                                <span>{new Date(idea.dateTime).toLocaleString()}</span>
                            </div>
                        </DetailItem>
                    </div>
                     <div className="mt-6"><DetailItem label="Appendix / Notes" value={idea.appendix || 'N/A'} /></div>
                     <div className="mt-6"><DetailItem label="Tools / Links" value={idea.toolLinks || 'N/A'} /></div>
                </div>
            </div>

            <div className="lg:col-span-1 bg-base-800 p-6 rounded-lg border border-base-700 flex flex-col gap-6 h-fit">
                <div>
                    <h3 className="text-xl font-bold text-base-content mb-4 flex items-center gap-2"><ActivityIcon /> Activity</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {idea.notes && idea.notes.length > 0 ? (
                            idea.notes.slice().reverse().map(note => (
                                <div key={note.id} className="bg-base-700/50 p-3 rounded-md">
                                    <div className="flex justify-between items-center text-xs text-base-content-secondary mb-1">
                                        <span className="font-semibold">{note.author}</span>
                                        <span>{new Date(note.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-base-content break-words">{note.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-base-content-secondary text-center py-4">No activity yet.</p>
                        )}
                    </div>
                     <div className="mt-4">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder={canEdit ? "Add a new note..." : "Only the claimant can add notes."}
                            rows={3}
                            disabled={!canEdit}
                            className="w-full bg-base-700 border-base-600 rounded-md shadow-sm p-2 text-base-content disabled:opacity-50 disabled:cursor-not-allowed focus:ring-brand-primary focus:border-brand-primary"
                        />
                        <button 
                            onClick={handleAddNote}
                            disabled={!canEdit}
                            className="mt-2 w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
                        >
                            <PlusIcon /> Add Note
                        </button>
                    </div>
                </div>

                 <div>
                    <h3 className="text-xl font-bold text-base-content mb-4 flex items-center gap-2"><PaperclipIcon /> Attachments</h3>
                     <div className="text-base-content-secondary text-center py-4 bg-base-700/50 rounded-md flex flex-col items-center gap-2">
                        <p>Attachment feature coming soon.</p>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default TaskDetailPage;