import React, { useState, useEffect } from 'react';

const References = () => {
  // Initial dummy data
  const initialRegulations = [
    {
      id: 1,
      title: "GHG Protocol Corporate Standard",
      category: "International Standard",
      description: "Comprehensive global standardized framework for measuring and managing greenhouse gas emissions from private and public sector operations.",
      lastUpdated: "2024-03-15",
      documents: [
        { name: "GHG Protocol 2024", url: "https://drive.google.com/file/d/example1" },
        { name: "Implementation Guide", url: "https://drive.google.com/file/d/example2" }
      ]
    },
    {
      id: 2,
      title: "ISO 14064-1:2018",
      category: "ISO Standard",
      description: "Specification with guidance at the organization level for quantification and reporting of greenhouse gas emissions and removals.",
      lastUpdated: "2024-02-20",
      documents: [
        { name: "ISO 14064 Standard", url: "https://drive.google.com/file/d/example3" }
      ]
    },
    {
      id: 3,
      title: "Indonesian PROPER Regulation",
      category: "National Regulation",
      description: "Ministry of Environment and Forestry regulation for environmental performance rating program including GHG reporting requirements.",
      lastUpdated: "2024-01-10",
      documents: [
        { name: "PROPER Guidelines 2024", url: "https://drive.google.com/file/d/example4" },
        { name: "Reporting Template", url: "https://docs.google.com/spreadsheets/d/example5" }
      ]
    }
  ];

  // Load data from localStorage or use initial data
  const [regulations, setRegulations] = useState(() => {
    try {
      const saved = localStorage.getItem('regulations');
      return saved ? JSON.parse(saved) : initialRegulations;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return initialRegulations;
    }
  });

  // Save to localStorage whenever regulations change
  useEffect(() => {
    try {
      localStorage.setItem('regulations', JSON.stringify(regulations));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [regulations]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReg, setEditingReg] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    documents: []
  });

  // State for adding new document link
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingReg, setDeletingReg] = useState(null);

  const handleEdit = (reg) => {
    setEditingReg(reg);
    setFormData({
      title: reg.title,
      category: reg.category,
      description: reg.description,
      documents: [...reg.documents]
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (reg) => {
    setDeletingReg(reg);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingReg) {
      setRegulations(regulations.filter(r => r.id !== deletingReg.id));
    }
    setIsDeleteModalOpen(false);
    setDeletingReg(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingReg(null);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingReg) {
      setRegulations(regulations.map(r => 
        r.id === editingReg.id 
          ? { ...r, ...formData, lastUpdated: new Date().toISOString().split('T')[0] }
          : r
      ));
    } else {
      setRegulations([...regulations, {
        id: Date.now(),
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      }]);
    }
    
    setIsAddModalOpen(false);
    setEditingReg(null);
    setFormData({ title: '', category: '', description: '', documents: [] });
    setNewDocName('');
    setNewDocUrl('');
  };

  const handleAddDocument = () => {
    if (!newDocName.trim()) {
      alert('Please enter document name');
      return;
    }
    
    if (!newDocUrl.trim()) {
      alert('Please enter document URL');
      return;
    }

    try {
      new URL(newDocUrl);
    } catch (e) {
      alert('Please enter a valid URL');
      return;
    }

    setFormData({
      ...formData,
      documents: [...formData.documents, { name: newDocName, url: newDocUrl }]
    });

    setNewDocName('');
    setNewDocUrl('');
  };

  const handleRemoveDocument = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index)
    });
  };

  const handleCancel = () => {
    setIsAddModalOpen(false);
    setEditingReg(null);
    setFormData({ title: '', category: '', description: '', documents: [] });
    setNewDocName('');
    setNewDocUrl('');
  };

  // // Clear all data (optional - untuk development/testing)
  // const handleClearAll = () => {
  //   if (window.confirm('⚠️ This will delete ALL regulations. Are you sure?')) {
  //     setRegulations([]);
  //     localStorage.removeItem('regulations');
  //   }
  // };

  // // Reset to default data (optional - untuk development/testing)
  // const handleResetToDefault = () => {
  //   if (window.confirm('Reset to default regulations?')) {
  //     setRegulations(initialRegulations);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-10">
              References 
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              onClick={() => { 
                setIsAddModalOpen(true); 
                setEditingReg(null); 
                setFormData({ title: '', category: '', description: '', documents: [] }); 
              }}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-semibold">Add Document</span> 
            </button>
          </div>
        </div>

        {/* Developer Tools (optional - comment out in production)
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-wrap gap-2">
            <span className="text-sm font-medium text-yellow-800">Dev Tools:</span>
            <button 
              onClick={handleResetToDefault}
              className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reset to Default
            </button>
            <button 
              onClick={handleClearAll}
              className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Data
            </button>
          </div>
        )} */}

        {/* Regulations List */}
        <div className="grid gap-6">
          {regulations.map(reg => (
            <div key={reg.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📄</span>
                    <h2 className="text-xl font-bold text-gray-800">{reg.title}</h2>
                  </div>
                  <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                    {reg.category}
                  </span>
                </div>
                <div className="flex gap-2 lg:flex-col lg:w-24">
                  <button 
                    onClick={() => handleEdit(reg)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium flex items-center justify-center gap-1"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(reg)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center justify-center gap-1"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{reg.description}</p>
              
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <span className="text-sm text-gray-500">
                    Last updated: <span className="font-medium text-gray-700">{reg.lastUpdated}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    {reg.documents.length} document{reg.documents.length !== 1 ? 's' : ''} attached
                  </span>
                </div>
                
                {reg.documents.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reg.documents.map((doc, idx) => (
                      <a 
                        key={idx}
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 rounded-lg hover:from-teal-100 hover:to-emerald-100 transition-all duration-200 text-sm font-medium group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{doc.name}</span>
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {regulations.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg">No regulations added yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Document" to get started</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingReg ? 'Edit References' : 'Add New References'}
                </h2>
                <button 
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                    placeholder="e.g., GHG Protocol Corporate Standard"
                    required
                  />
                </div>
                
                {/* Category */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="International Standard">International Standard</option>
                    <option value="ISO Standard">ISO Standard</option>
                    <option value="National Regulation">National Regulation</option>
                    <option value="Company Policy">Company Policy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {/* Description */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all resize-none"
                    rows="4"
                    placeholder="Brief description of this reference..."
                    required
                  />
                </div>
                
                {/* Document Links */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Document Links (Google Drive, Dropbox, etc.)
                  </label>
                  
                  {/* Add Document Form */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-300">
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                      <input 
                        type="text"
                        placeholder="Document name (e.g., GHG Protocol 2024)"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                      />
                      <input 
                        type="url"
                        placeholder="https://drive.google.com/..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                        value={newDocUrl}
                        onChange={(e) => setNewDocUrl(e.target.value)}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleAddDocument}
                      className="w-full sm:w-auto px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Document
                    </button>
                  </div>
                  
                  {/* Document List */}
                  {formData.documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium mb-2">
                        Added Documents ({formData.documents.length}):
                      </p>
                      {formData.documents.map((doc, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-teal-300 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-teal-600 hover:underline truncate block"
                              >
                                {doc.url}
                              </a>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveDocument(idx)}
                            className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Remove document"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.documents.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No documents added yet. Add document links above.
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    {editingReg ? 'Update Reference' : 'Add Reference'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  🗑️ Delete Reference
                </h2>
                <button 
                  onClick={cancelDelete}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>"{deletingReg?.title}"</strong>?
                <br />
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
                >
                  Delete Reference
                </button>
                <button 
                  onClick={cancelDelete} 
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default References;