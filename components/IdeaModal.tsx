import React, { useState, useEffect } from 'react';
import { Idea, User } from '../types';

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (idea: any) => void;
  idea: Idea | null;
  currentUser: User;
}

const inputStyles = "mt-1 block w-full bg-base-700 border-base-600 rounded-md shadow-sm p-2 text-base-content focus:ring-brand-primary focus:border-brand-primary";
const disabledInputStyles = "disabled:bg-base-700/50 disabled:cursor-not-allowed";

const IdeaModal: React.FC<IdeaModalProps> = ({ isOpen, onClose, onSubmit, idea, currentUser }) => {
  const getInitialFormData = () => ({
    dateTime: new Date().toISOString().substring(0, 16),
    employeeName: idea ? idea.employeeName : currentUser.name,
    employeeEmail: idea ? idea.employeeEmail : currentUser.email,
    managerEmail: idea ? idea.managerEmail : '',
    department: idea ? idea.department : '',
    context: idea ? idea.context : '',
    appendix: idea ? idea.appendix || '' : '',
    toolLinks: idea ? idea.toolLinks || '' : '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [idea, isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = idea ? { ...idea, ...formData } : formData;
    onSubmit(submissionData);
    onClose();
  };

  if (!isOpen) return null;
  
  const isViewingExisting = !!idea;
  const isCreatingNew = !idea;
  const readOnly = isViewingExisting && idea.employeeEmail !== currentUser.email;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-base-800 rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-base-700">
        <h2 className="text-2xl font-bold mb-6 text-base-content">{idea ? 'Idea Details' : 'Submit New Idea'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employeeName" className="block text-sm font-medium text-base-content-secondary">Employee Name</label>
              <input type="text" id="employeeName" name="employeeName" value={formData.employeeName} onChange={handleChange} required className={`${inputStyles} ${disabledInputStyles}`} disabled />
            </div>
            <div>
              <label htmlFor="employeeEmail" className="block text-sm font-medium text-base-content-secondary">Employee Email</label>
              <input type="email" id="employeeEmail" name="employeeEmail" value={formData.employeeEmail} onChange={handleChange} required className={`${inputStyles} ${disabledInputStyles}`} disabled />
            </div>
            <div>
              <label htmlFor="managerEmail" className="block text-sm font-medium text-base-content-secondary">Manager Email</label>
              <input type="email" id="managerEmail" name="managerEmail" value={formData.managerEmail} onChange={handleChange} required className={inputStyles} readOnly={readOnly} />
            </div>
            <div>
                <label htmlFor="dateTime" className="block text-sm font-medium text-base-content-secondary">Date & Time</label>
                <input type="datetime-local" id="dateTime" name="dateTime" value={formData.dateTime} onChange={handleChange} required className={inputStyles} readOnly={readOnly} />
            </div>
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-base-content-secondary">Department / Process</label>
            <input type="text" id="department" name="department" value={formData.department} onChange={handleChange} required className={inputStyles} readOnly={readOnly} />
          </div>
          <div>
            <label htmlFor="context" className="block text-sm font-medium text-base-content-secondary">Context / Short Brief</label>
            <textarea id="context" name="context" rows={4} value={formData.context} onChange={handleChange} required className={inputStyles} readOnly={readOnly}></textarea>
          </div>
          <div>
            <label htmlFor="appendix" className="block text-sm font-medium text-base-content-secondary">Appendix / Additional Notes</label>
            <textarea id="appendix" name="appendix" rows={3} value={formData.appendix} onChange={handleChange} className={inputStyles} readOnly={readOnly}></textarea>
          </div>
          <div>
            <label htmlFor="toolLinks" className="block text-sm font-medium text-base-content-secondary">Tool Links / References</label>
            <input type="text" id="toolLinks" name="toolLinks" value={formData.toolLinks} onChange={handleChange} className={inputStyles} readOnly={readOnly} />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-base-700 hover:bg-base-600 text-base-content font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              {idea ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
                <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg shadow-brand-primary/20">
                  {isCreatingNew ? 'Submit Idea' : 'Save Changes'}
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdeaModal;