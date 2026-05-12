import React, { useState, useEffect } from 'react';

const GHGReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    year: '', 
    type: 'Annual Report', 
    documents: [] 
  });

  // State for adding document links
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  // Role check
  const userRole = 'ghg_team';
  const canEdit = userRole === 'ghg_team' || userRole === 'admin';

  // Initial data
  const initialReports = [
    {
      id: 1,
      title: 'GHG Report Year 2023',
      year: '2023',
      lastUpdated: '15 Jan 2024',
      status: 'Published',
      type: 'Annual Report',
      documents: [
        { name: 'Full Report PDF', url: 'https://drive.google.com/file/d/example1' },
        { name: 'Executive Summary', url: 'https://drive.google.com/file/d/example2' }
      ]
    },
    {
      id: 2,
      title: 'GHG Report Year 2024',
      year: '2024',
      lastUpdated: '28 Sep 2025',
      status: 'Published',
      type: 'Annual Report',
      documents: [
        { name: 'Annual Report 2024', url: 'https://drive.google.com/file/d/example3' }
      ]
    },
    {
      id: 3,
      title: 'Sustainability Summary Q3 2024',
      year: '2024',
      lastUpdated: '30 Sep 2024',
      status: 'Published',
      type: 'Quarterly',
      documents: [
        { name: 'Q3 Summary', url: 'https://drive.google.com/file/d/example4' }
      ]
    }
  ];

  // Load from localStorage
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('ghgReports');
      return saved ? JSON.parse(saved) : initialReports;
    } catch (error) {
      console.error('Error loading reports:', error);
      return initialReports;
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ghgReports', JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  }, [reports]);

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.year.includes(searchTerm) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (mode, report = null) => {
    if (!canEdit && mode !== 'view') return;
    setModalMode(mode);
    setSelectedReport(report);
    
    if (report) {
      setFormData({ 
        title: report.title, 
        year: report.year, 
        type: report.type, 
        documents: [...report.documents] 
      });
    } else {
      setFormData({ 
        title: '', 
        year: new Date().getFullYear().toString(), 
        type: 'Annual Report', 
        documents: [] 
      });
    }
    
    setNewDocName('');
    setNewDocUrl('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setFormData({ title: '', year: '', type: 'Annual Report', documents: [] });
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
      documents: [...formData.documents, { name: newDocName.trim(), url: newDocUrl.trim() }]
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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (modalMode === 'delete') {
      setReports(reports.filter(r => r.id !== selectedReport.id));
      closeModal();
      return;
    }
    
    if (!formData.title.trim()) {
      alert('Please enter report title');
      return;
    }
    
    if (!formData.year.trim()) {
      alert('Please enter year');
      return;
    }

    if (formData.documents.length === 0) {
      alert('Please add at least one document link');
      return;
    }
    
    if (modalMode === 'upload') {
      const newReport = {
        id: Date.now(),
        title: formData.title.trim(),
        year: formData.year.trim(),
        type: formData.type,
        lastUpdated: now,
        status: 'Published',
        documents: formData.documents
      };
      setReports([newReport, ...reports]);
    } else if (modalMode === 'edit') {
      setReports(reports.map(r => r.id === selectedReport.id ? 
        { 
          ...r, 
          title: formData.title.trim(),
          year: formData.year.trim(),
          type: formData.type,
          documents: formData.documents,
          lastUpdated: now 
        } : r
      ));
    }
    
    closeModal();
  };

  // const handleDownloadClick = (reportId) => {
  //   setReports(reports.map(r => 
  //     r.id === reportId ? { ...r, downloadCount: r.downloadCount + 1 } : r
  //   ));
  // };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    if (status === 'Published') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (status === 'Draft') {
      return `${baseClasses} bg-orange-100 text-orange-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const getTypeIcon = (type) => {
    if (type === 'Annual Report') {
      return (
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    } else if (type === 'Quarterly') {
      return (
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 mt-10 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Our GHG Reports
            </h1>
          </div>
          
          {canEdit && (
            <button 
              onClick={() => openModal('upload')}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Report
            </button>
          )}
        </div>

        {/* Search */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <label className="flex items-center text-base font-semibold text-gray-900 mb-3">
            <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-3"></div>
            Search Reports
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title, year, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first report to get started.'}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {getTypeIcon(report.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
                        <span className={getStatusBadge(report.status)}>{report.status}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          {report.type}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span>Year: <strong>{report.year}</strong></span>
                        <span>Updated: {report.lastUpdated}</span>
                      </div>

                      {/* Document Links */}
                      {report.documents.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {report.documents.map((doc, idx) => (
                            <a
                              key={idx}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-lg hover:from-emerald-100 hover:to-teal-100 transition-all text-sm font-medium group"
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

                  {canEdit && (
                    <div className="flex gap-2 lg:flex-col lg:w-24">
                      <button 
                        onClick={() => openModal('edit', report)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium flex items-center justify-center gap-1"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => openModal('delete', report)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center justify-center gap-1"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {modalMode === 'upload' ? '📤 Upload Report' : 
                   modalMode === 'edit' ? '✏️ Edit Report' : '🗑️ Delete Report'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {modalMode === 'delete' ? (
                <div>
                  <p className="text-gray-700 mb-6">
                    Are you sure you want to delete <strong>"{selectedReport?.title}"</strong>?
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSubmit} 
                      className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
                    >
                      Delete Report
                    </button>
                    <button 
                      onClick={closeModal} 
                      className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Report Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., GHG Report Year 2024"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                      required
                    />
                  </div>
                  
                  {/* Year */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="2024"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                      required
                    />
                  </div>
                  
                  {/* Type */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Report Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    >
                      <option value="Annual Report">Annual Report</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Special Report">Special Report</option>
                    </select>
                  </div>
                  
                  {/* Document Links */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Document Links (Google Drive) <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Add Document Form */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-300">
                      <div className="flex flex-col sm:flex-row gap-3 mb-3">
                        <input 
                          type="text"
                          placeholder="Document name (e.g., Full Report PDF)"
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                        />
                        <input 
                          type="url"
                          placeholder="https://drive.google.com/..."
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          value={newDocUrl}
                          onChange={(e) => setNewDocUrl(e.target.value)}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleAddDocument}
                        className="w-full sm:w-auto px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
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
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-emerald-300 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                                <a 
                                  href={doc.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-emerald-600 hover:underline truncate block"
                                >
                                  {doc.url}
                                </a>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleRemoveDocument(idx)}
                              className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
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
                        No documents added yet. Please add at least one document link.
                      </p>
                    )}
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
                    <button 
                      type="button"
                      onClick={closeModal} 
                      className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg"
                    >
                      {modalMode === 'upload' ? '📤 Upload Report' : '💾 Update Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GHGReports;