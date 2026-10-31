import React, { useState, useEffect, memo } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Languages,
  Wrench,
  FileText,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  FileDown
} from 'lucide-react';
import { buildPdfFileName } from '../utils/exportPdf';

const parseList = (text) => text.split(',').map((s) => s.trim()).filter(Boolean);

/**
 * Comma-separated list input. Keeps the raw text locally so commas and spaces
 * can be typed freely, while the parsed list is saved on every change.
 */
function ListTextInput({ value, onChange, placeholder }) {
  const [text, setText] = useState(value.join(', '));

  // Follow outside changes (undo, reset) without clobbering what is being typed
  useEffect(() => {
    if (parseList(text).join('\n') !== value.join('\n')) setText(value.join(', '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="text"
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parseList(e.target.value));
      }}
    />
  );
}

function ResumeEditor({
  data,
  setData,
  isOpen,
  onClose,
  pdfQuality = 'high',
  setPdfQuality = () => {},
  pdfMode = 'vector',
  setPdfMode = () => {}
}) {
  const [activeTab, setActiveTab] = useState('header');

  if (!isOpen) return null;

  const updateHeader = (field, val) => {
    setData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: val
      }
    }));
  };

  const updateContact = (index, field, val) => {
    setData((prev) => {
      const contacts = [...prev.header.contacts];
      contacts[index] = { ...contacts[index], [field]: val };
      return {
        ...prev,
        header: {
          ...prev.header,
          contacts
        }
      };
    });
  };

  const addContact = () => {
    setData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        contacts: [...prev.header.contacts, { label: 'New Field', value: 'Details' }]
      }
    }));
  };

  const removeContact = (index) => {
    setData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        contacts: prev.header.contacts.filter((_, i) => i !== index)
      }
    }));
  };

  const updateSummary = (content) => {
    setData((prev) => ({
      ...prev,
      summary: {
        ...prev.summary,
        content
      }
    }));
  };

  // Skill column editor
  const updateSkill = (colIdx, skillIdx, val) => {
    setData((prev) => {
      const newCols = prev.skills.columns.map((col, cIdx) => {
        if (cIdx !== colIdx) return col;
        const newCol = [...col];
        newCol[skillIdx] = val;
        return newCol;
      });
      return {
        ...prev,
        skills: {
          ...prev.skills,
          columns: newCols
        }
      };
    });
  };

  const addSkill = (colIdx) => {
    setData((prev) => {
      const newCols = prev.skills.columns.map((col, cIdx) => {
        if (cIdx !== colIdx) return col;
        return [...col, 'New Skill / Specialization'];
      });
      return {
        ...prev,
        skills: {
          ...prev.skills,
          columns: newCols
        }
      };
    });
  };

  const removeSkill = (colIdx, skillIdx) => {
    setData((prev) => {
      const newCols = prev.skills.columns.map((col, cIdx) => {
        if (cIdx !== colIdx) return col;
        return col.filter((_, sIdx) => sIdx !== skillIdx);
      });
      return {
        ...prev,
        skills: {
          ...prev.skills,
          columns: newCols
        }
      };
    });
  };

  // Grouped skills updater helpers
  const updateGroupHeading = (gIdx, heading) => {
    setData((prev) => {
      const groups = (prev.skills.groups || []).map((g, i) => (i === gIdx ? { ...g, heading } : g));
      return { ...prev, skills: { ...prev.skills, groups } };
    });
  };

  const updateGroupSkill = (gIdx, sIdx, val) => {
    setData((prev) => {
      const groups = (prev.skills.groups || []).map((g, i) => {
        if (i !== gIdx) return g;
        const items = [...g.items];
        items[sIdx] = val;
        return { ...g, items };
      });
      return { ...prev, skills: { ...prev.skills, groups } };
    });
  };

  const addGroupSkill = (gIdx) => {
    setData((prev) => {
      const groups = (prev.skills.groups || []).map((g, i) => {
        if (i !== gIdx) return g;
        return { ...g, items: [...g.items, 'New Skill'] };
      });
      return { ...prev, skills: { ...prev.skills, groups } };
    });
  };

  const removeGroupSkill = (gIdx, sIdx) => {
    setData((prev) => {
      const groups = (prev.skills.groups || []).map((g, i) => {
        if (i !== gIdx) return g;
        return { ...g, items: g.items.filter((_, idx) => idx !== sIdx) };
      });
      return { ...prev, skills: { ...prev.skills, groups } };
    });
  };

  const addGroup = () => {
    setData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        groups: [...(prev.skills.groups || []), { heading: 'NEW GROUP', items: ['New Skill'] }]
      }
    }));
  };

  const removeGroup = (gIdx) => {
    const group = data.skills.groups[gIdx];
    if (!window.confirm(`Delete the skill group "${group.heading || 'Untitled'}" and its ${group.items.length} skills?`)) return;
    setData((prev) => ({
      ...prev,
      skills: { ...prev.skills, groups: prev.skills.groups.filter((_, i) => i !== gIdx) }
    }));
  };

  // Experience editor
  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experiences: [
        {
          id: `exp-${Date.now()}`,
          jobTitle: 'JOB TITLE',
          company: 'Company Name',
          location: 'City, Country',
          dateRange: 'START – PRESENT',
          sections: [
            {
              heading: '',
              items: [{ label: 'Key Responsibility', text: 'Describe what you did and the result it achieved.' }]
            }
          ]
        },
        ...prev.experiences
      ]
    }));
  };

  const moveExperience = (expIdx, delta) => {
    setData((prev) => {
      const target = expIdx + delta;
      if (target < 0 || target >= prev.experiences.length) return prev;
      const exps = [...prev.experiences];
      [exps[expIdx], exps[target]] = [exps[target], exps[expIdx]];
      return { ...prev, experiences: exps };
    });
  };

  const removeExperience = (expIdx) => {
    const exp = data.experiences[expIdx];
    if (!window.confirm(`Delete the job "${exp.jobTitle} – ${exp.company}"? (Ctrl+Z can undo this)`)) return;
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== expIdx)
    }));
  };

  const updateExp = (expIdx, field, val) => {
    setData((prev) => {
      const newExps = [...prev.experiences];
      newExps[expIdx] = { ...newExps[expIdx], [field]: val };
      return { ...prev, experiences: newExps };
    });
  };

  // Immutable updates only: undo history and the original presets share these objects
  const updateSections = (expIdx, fn) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === expIdx ? { ...exp, sections: fn(exp.sections) } : exp
      )
    }));
  };

  const updateSection = (expIdx, secIdx, fn) => {
    updateSections(expIdx, (sections) =>
      sections.map((sec, i) => (i === secIdx ? fn(sec) : sec))
    );
  };

  const updateSubgroupHeading = (expIdx, secIdx, heading) => {
    updateSection(expIdx, secIdx, (sec) => ({ ...sec, heading }));
  };

  const updateExpItem = (expIdx, secIdx, itemIdx, field, val) => {
    updateSection(expIdx, secIdx, (sec) => ({
      ...sec,
      items: sec.items.map((item, i) => (i === itemIdx ? { ...item, [field]: val } : item))
    }));
  };

  const addExpItem = (expIdx, secIdx) => {
    updateSection(expIdx, secIdx, (sec) => ({
      ...sec,
      items: [
        ...sec.items,
        {
          label: 'Feature / Responsibility',
          text: 'Detailed description of achievements and tasks.'
        }
      ]
    }));
  };

  const removeExpItem = (expIdx, secIdx, itemIdx) => {
    updateSection(expIdx, secIdx, (sec) => ({
      ...sec,
      items: sec.items.filter((_, i) => i !== itemIdx)
    }));
  };

  const addSubgroup = (expIdx) => {
    updateSections(expIdx, (sections) => [
      ...sections,
      {
        heading: 'New Category',
        items: [{ label: 'Item Name', text: 'Specification or description.' }]
      }
    ]);
  };

  const removeSubgroup = (expIdx, secIdx) => {
    updateSections(expIdx, (sections) => sections.filter((_, i) => i !== secIdx));
  };

  // Education editor
  const updateEducation = (field, val) => {
    setData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        [field]: val
      }
    }));
  };

  const updateEduHighlight = (idx, val) => {
    setData((prev) => {
      const newHighlights = [...prev.education.highlights];
      newHighlights[idx] = val;
      return {
        ...prev,
        education: {
          ...prev.education,
          highlights: newHighlights
        }
      };
    });
  };

  const addEduHighlight = () => {
    setData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        highlights: [...prev.education.highlights, 'Key achievement or coursework detail.']
      }
    }));
  };

  const removeEduHighlight = (idx) => {
    setData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        highlights: prev.education.highlights.filter((_, i) => i !== idx)
      }
    }));
  };

  // Languages editor
  const updateLang = (idx, field, val) => {
    setData((prev) => {
      const newItems = [...prev.languages.items];
      newItems[idx] = { ...newItems[idx], [field]: val };
      return {
        ...prev,
        languages: {
          ...prev.languages,
          items: newItems
        }
      };
    });
  };

  const addLang = () => {
    setData((prev) => ({
      ...prev,
      languages: {
        ...prev.languages,
        items: [...prev.languages.items, { name: 'Language', level: 'Working Proficiency' }]
      }
    }));
  };

  const removeLang = (idx) => {
    setData((prev) => ({
      ...prev,
      languages: {
        ...prev.languages,
        items: prev.languages.items.filter((_, i) => i !== idx)
      }
    }));
  };

  return (
    <aside className="cv-editor-drawer">
      <div className="cv-editor-header">
        <div className="cv-editor-title">
          <FileText size={18} className="cv-editor-icon" />
          <span>Edit CV Details</span>
        </div>
        <div className="cv-editor-header-actions">
          <button className="cv-done-btn" onClick={onClose} title="Save changes and close editor">
            <Check size={14} />
            <span>Done</span>
          </button>
          <button className="cv-close-btn" onClick={onClose} title="Close drawer">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="cv-editor-tabs">
        <button
          className={`cv-tab-btn ${activeTab === 'header' ? 'active' : ''}`}
          onClick={() => setActiveTab('header')}
        >
          <User size={14} />
          <span>Profile</span>
        </button>
        <button
          className={`cv-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <FileText size={14} />
          <span>Summary</span>
        </button>
        <button
          className={`cv-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <Wrench size={14} />
          <span>Skills</span>
        </button>
        <button
          className={`cv-tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          <Briefcase size={14} />
          <span>Experience</span>
        </button>
        <button
          className={`cv-tab-btn ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          <GraduationCap size={14} />
          <span>Education</span>
        </button>
        <button
          className={`cv-tab-btn ${activeTab === 'languages' ? 'active' : ''}`}
          onClick={() => setActiveTab('languages')}
        >
          <Languages size={14} />
          <span>Languages</span>
        </button>
        <button
          className={`cv-tab-btn ${activeTab === 'declaration' ? 'active' : ''}`}
          onClick={() => setActiveTab('declaration')}
        >
          <FileText size={14} />
          <span>Declaration</span>
        </button>
        <button
          className={`cv-tab-btn ${activeTab === 'pdf' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdf')}
        >
          <FileDown size={14} />
          <span>PDF</span>
        </button>
      </div>

      <div className="cv-editor-body">
        {/* TAB 1: HEADER & PROFILE */}
        {activeTab === 'header' && (
          <div className="cv-form-section">
            <h3 className="cv-form-heading">Personal Information</h3>
            <div className="cv-field">
              <label>Full Name</label>
              <input
                type="text"
                value={data.header.fullName}
                onChange={(e) => updateHeader('fullName', e.target.value)}
                placeholder="ASRIF AHAMED"
              />
            </div>
            <div className="cv-field">
              <label>Job Title / Position</label>
              <input
                type="text"
                value={data.header.jobTitle}
                onChange={(e) => updateHeader('jobTitle', e.target.value)}
                placeholder="COMMIS II (HOT & COLD)"
              />
            </div>

            <div className="cv-field-toggle">
              <label>Show Profile Photo on Header</label>
              <button
                className={`cv-toggle-btn ${data.header.showPhoto ? 'on' : 'off'}`}
                onClick={() => updateHeader('showPhoto', !data.header.showPhoto)}
              >
                {data.header.showPhoto ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{data.header.showPhoto ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>

            {data.header.showPhoto && data.header.photoUrl && (
              <div className="cv-subfield-section cv-photo-adjust">
                <div className="cv-subfield-header">
                  <label>Photo Framing</label>
                  <button
                    className="cv-mini-add-btn"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        header: { ...prev.header, photoZoom: 1, photoPosX: 50, photoPosY: 0 }
                      }))
                    }
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
                {[
                  { field: 'photoZoom', label: 'Zoom', min: 1, max: 3, step: 0.05, fallback: 1, format: (v) => `${Math.round(v * 100)}%` },
                  { field: 'photoPosX', label: 'Left / Right', min: 0, max: 100, step: 1, fallback: 50, format: (v) => `${v}%` },
                  { field: 'photoPosY', label: 'Up / Down', min: 0, max: 100, step: 1, fallback: 0, format: (v) => `${v}%` }
                ].map(({ field, label, min, max, step, fallback, format }) => (
                  <div key={field} className="cv-range-row">
                    <span className="cv-range-label">{label}</span>
                    <input
                      type="range"
                      className="cv-range"
                      min={min}
                      max={max}
                      step={step}
                      value={data.header[field] ?? fallback}
                      onChange={(e) => updateHeader(field, Number(e.target.value))}
                    />
                    <span className="cv-range-value">{format(data.header[field] ?? fallback)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="cv-subfield-section">
              <div className="cv-subfield-header">
                <label>Contact Details List</label>
                <button className="cv-mini-add-btn" onClick={addContact}>
                  <Plus size={13} /> Add Item
                </button>
              </div>

              {data.header.contacts.map((contact, i) => (
                <div key={i} className="cv-contact-edit-block">
                  <div className="cv-contact-edit-row">
                    <input
                      type="text"
                      className="cv-input-label"
                      value={contact.label}
                      onChange={(e) => updateContact(i, 'label', e.target.value)}
                      placeholder="Label (e.g. Mobile)"
                    />
                    <input
                      type="text"
                      className="cv-input-val"
                      value={contact.value}
                      onChange={(e) => updateContact(i, 'value', e.target.value)}
                      placeholder="Value (e.g. +971...)"
                    />
                    <button
                      className="cv-trash-btn"
                      onClick={() => removeContact(i)}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <input
                    type="text"
                    className="cv-input-val cv-input-link"
                    value={contact.link || ''}
                    onChange={(e) => updateContact(i, 'link', e.target.value || undefined)}
                    placeholder="Link (optional): https://…, mailto:…, tel:…"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROFESSIONAL SUMMARY */}
        {activeTab === 'summary' && (
          <div className="cv-form-section">
            <h3 className="cv-form-heading">Professional Summary</h3>
            <p className="cv-help-text">
              A comprehensive summary positioned directly below the header banner.
            </p>
            <div className="cv-field">
              <label>Summary Title</label>
              <input
                type="text"
                value={data.summary.title}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    summary: { ...prev.summary, title: e.target.value }
                  }))
                }
              />
            </div>
            <div className="cv-field">
              <label>Summary Content</label>
              <textarea
                rows={9}
                value={data.summary.content}
                onChange={(e) => updateSummary(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS & KNOWLEDGE */}
        {activeTab === 'skills' && (
          <div className="cv-form-section">
            <h3 className="cv-form-heading">Skills & Knowledge</h3>
            <p className="cv-help-text">
              Each group or column is shown side by side on the CV.
            </p>
            <div className="cv-field">
              <label>Section Title</label>
              <input
                type="text"
                value={data.skills.title}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, skills: { ...prev.skills, title: e.target.value } }))
                }
              />
            </div>
            {data.skills.groups && (
              <div className="cv-subfield-header">
                <label>Skill Groups ({data.skills.groups.length})</label>
                <button className="cv-mini-add-btn" onClick={addGroup}>
                  <Plus size={13} /> Add Group
                </button>
              </div>
            )}
            {data.skills.groups ? (
              data.skills.groups.map((group, gIdx) => (
                <div key={gIdx} className="cv-skill-column-box">
                  <div className="cv-subfield-header">
                    <input
                      type="text"
                      className="cv-subgroup-title-input"
                      value={group.heading}
                      placeholder="Category Heading"
                      onChange={(e) => updateGroupHeading(gIdx, e.target.value)}
                    />
                    <div className="cv-subgroup-actions">
                      <button
                        className="cv-mini-add-btn"
                        onClick={() => addGroupSkill(gIdx)}
                      >
                        <Plus size={13} /> Add Skill
                      </button>
                      <button
                        className="cv-trash-btn"
                        onClick={() => removeGroup(gIdx)}
                        title="Delete this group"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {group.items.map((skill, sIdx) => (
                    <div key={sIdx} className="cv-skill-edit-row">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateGroupSkill(gIdx, sIdx, e.target.value)}
                      />
                      <button
                        className="cv-trash-btn"
                        onClick={() => removeGroupSkill(gIdx, sIdx)}
                        title="Remove skill"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              (data.skills.columns || []).map((col, colIdx) => (
                <div key={colIdx} className="cv-skill-column-box">
                  <div className="cv-subfield-header">
                    <h4>Column {colIdx + 1}</h4>
                    <button
                      className="cv-mini-add-btn"
                      onClick={() => addSkill(colIdx)}
                    >
                      <Plus size={13} /> Add Skill
                    </button>
                  </div>
                  {col.map((skill, sIdx) => (
                    <div key={sIdx} className="cv-skill-edit-row">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(colIdx, sIdx, e.target.value)}
                      />
                      <button
                        className="cv-trash-btn"
                        onClick={() => removeSkill(colIdx, sIdx)}
                        title="Remove skill"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}

            <div className="cv-field">
              <label>Industries (optional, separate with commas)</label>
              <ListTextInput
                value={data.skills.industries || []}
                onChange={(industries) =>
                  setData((prev) => ({ ...prev, skills: { ...prev.skills, industries } }))
                }
                placeholder="e.g. Fintech, SaaS, E-Learning"
              />
              <p className="cv-help-text">Shown as one line under the skills, e.g. "INDUSTRIES: Fintech · SaaS".</p>
            </div>
          </div>
        )}

        {/* TAB 4: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="cv-form-section">
            <h3 className="cv-form-heading">Professional Experience</h3>
            <div className="cv-field">
              <label>Section Title</label>
              <input
                type="text"
                value={data.experienceTitle ?? 'PROFESSIONAL EXPERIENCE'}
                onChange={(e) => setData((prev) => ({ ...prev, experienceTitle: e.target.value }))}
              />
            </div>
            <div className="cv-subfield-header">
              <label>Jobs ({data.experiences.length})</label>
              <button className="cv-mini-add-btn" onClick={addExperience}>
                <Plus size={13} /> Add Job
              </button>
            </div>
            {data.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="cv-exp-card">
                <div className="cv-exp-card-header">
                  <h4>Experience #{expIdx + 1}</h4>
                  <div className="cv-subgroup-actions">
                    <button
                      className="cv-mini-add-btn"
                      onClick={() => moveExperience(expIdx, -1)}
                      disabled={expIdx === 0}
                      title="Move up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      className="cv-mini-add-btn"
                      onClick={() => moveExperience(expIdx, 1)}
                      disabled={expIdx === data.experiences.length - 1}
                      title="Move down"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      className="cv-trash-btn"
                      onClick={() => removeExperience(expIdx)}
                      title="Delete this job"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="cv-field-grid">
                  <div className="cv-field">
                    <label>Role / Designation</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => updateExp(expIdx, 'jobTitle', e.target.value)}
                    />
                  </div>
                  <div className="cv-field">
                    <label>Date Range</label>
                    <input
                      type="text"
                      value={exp.dateRange}
                      onChange={(e) => updateExp(expIdx, 'dateRange', e.target.value)}
                    />
                  </div>
                </div>
                <div className="cv-field-grid">
                  <div className="cv-field">
                    <label>Company / Organization</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExp(expIdx, 'company', e.target.value)}
                    />
                  </div>
                  <div className="cv-field">
                    <label>Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExp(expIdx, 'location', e.target.value)}
                    />
                  </div>
                </div>

                {/* Subgroups */}
                <div className="cv-exp-subsections">
                  <div className="cv-subfield-header">
                    <h5>Task Categories & Bullets</h5>
                    <button
                      className="cv-mini-add-btn"
                      onClick={() => addSubgroup(expIdx)}
                    >
                      <Plus size={13} /> Add Category
                    </button>
                  </div>

                  {exp.sections.map((sec, secIdx) => (
                    <div key={secIdx} className="cv-subgroup-box">
                      <div className="cv-subgroup-top">
                        <input
                          type="text"
                          className="cv-subgroup-title-input"
                          value={sec.heading}
                          placeholder="Category (e.g. Gourmet Salads)"
                          onChange={(e) =>
                            updateSubgroupHeading(expIdx, secIdx, e.target.value)
                          }
                        />
                        <div className="cv-subgroup-actions">
                          <button
                            className="cv-mini-add-btn"
                            onClick={() => addExpItem(expIdx, secIdx)}
                            title="Add bullet point"
                          >
                            <Plus size={12} /> Add Item
                          </button>
                          <button
                            className="cv-trash-btn"
                            onClick={() => removeSubgroup(expIdx, secIdx)}
                            title="Delete category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {sec.items.map((item, itIdx) => (
                        <div key={itIdx} className="cv-item-edit-row">
                          <input
                            type="text"
                            className="cv-item-label-input"
                            value={item.label}
                            placeholder="Prefix (e.g. Hot Selections)"
                            onChange={(e) =>
                              updateExpItem(
                                expIdx,
                                secIdx,
                                itIdx,
                                'label',
                                e.target.value
                              )
                            }
                          />
                          <textarea
                            className="cv-item-text-input"
                            rows={2}
                            value={item.text}
                            placeholder="Bullet details..."
                            onChange={(e) =>
                              updateExpItem(
                                expIdx,
                                secIdx,
                                itIdx,
                                'text',
                                e.target.value
                              )
                            }
                          />
                          <button
                            className="cv-trash-btn"
                            onClick={() =>
                              removeExpItem(expIdx, secIdx, itIdx)
                            }
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: EDUCATION */}
        {activeTab === 'education' && (
          <div className="cv-form-section">
            <h3 className="cv-form-heading">Education & Qualifications</h3>
            <div className="cv-field">
              <label>Section Title</label>
              <input
                type="text"
                value={data.education.title}
                onChange={(e) => updateEducation('title', e.target.value)}
              />
            </div>
            <div className="cv-field">
              <label>Degree / Certificate Level</label>
              <input
                type="text"
                value={data.education.degree}
                onChange={(e) => updateEducation('degree', e.target.value)}
              />
            </div>
            <div className="cv-field">
              <label>Institution & Location</label>
              <input
                type="text"
                value={data.education.institution}
                onChange={(e) => updateEducation('institution', e.target.value)}
              />
            </div>

            <div className="cv-subfield-section">
              <div className="cv-subfield-header">
                <label>Key Course Highlights & Achievements</label>
                <button className="cv-mini-add-btn" onClick={addEduHighlight}>
                  <Plus size={13} /> Add Point
                </button>
              </div>

              {(data.education.highlights || []).map((h, i) => (
                <div key={i} className="cv-edu-edit-row">
                  <textarea
                    rows={2}
                    value={h}
                    onChange={(e) => updateEduHighlight(i, e.target.value)}
                  />
                  <button
                    className="cv-trash-btn"
                    onClick={() => removeEduHighlight(i)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LANGUAGES */}
        {activeTab === 'languages' && (
          <div className="cv-form-section">
            <h3 className="cv-form-heading">Languages</h3>
            <div className="cv-field">
              <label>Section Title</label>
              <input
                type="text"
                value={data.languages.title}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, languages: { ...prev.languages, title: e.target.value } }))
                }
              />
            </div>
            <div className="cv-subfield-header">
              <p className="cv-help-text" style={{ margin: 0 }}>
                Languages are displayed in a clean balanced horizontal bar.
              </p>
              <button className="cv-mini-add-btn" onClick={addLang}>
                <Plus size={13} /> Add Language
              </button>
            </div>

            {data.languages.items.map((lang, i) => (
              <div key={i} className="cv-contact-edit-row">
                <input
                  type="text"
                  className="cv-input-label"
                  value={lang.name}
                  placeholder="Language (e.g. English)"
                  onChange={(e) => updateLang(i, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className="cv-input-val"
                  value={lang.level}
                  placeholder="Proficiency (e.g. Professional)"
                  onChange={(e) => updateLang(i, 'level', e.target.value)}
                />
                <button
                  className="cv-trash-btn"
                  onClick={() => removeLang(i)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: DECLARATION */}
        {activeTab === 'declaration' && (
          <div className="cv-form-section">
            <h3 className="cv-form-heading">Declaration</h3>
            <div className="cv-field-toggle">
              <label>Show Declaration on CV</label>
              <button
                className={`cv-toggle-btn ${data.declaration ? 'on' : 'off'}`}
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    declaration: prev.declaration
                      ? undefined
                      : {
                          title: 'DECLARATION',
                          text: 'I hereby confirm that the particulars furnished by me are true and correct to the best of my knowledge and belief.',
                          signature: prev.header.fullName
                        }
                  }))
                }
              >
                {data.declaration ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{data.declaration ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
            <div className="cv-field">
              <label>Section Title</label>
              <input
                type="text"
                value={data.declaration?.title || ''}
                disabled={!data.declaration}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    declaration: { ...prev.declaration, title: e.target.value }
                  }))
                }
              />
            </div>
            <div className="cv-field">
              <label>Declaration Statement</label>
              <textarea
                rows={3}
                value={data.declaration?.text || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    declaration: {
                      ...(prev.declaration || { title: 'DECLARATION' }),
                      text: e.target.value
                    }
                  }))
                }
              />
            </div>
            <div className="cv-field">
              <label>Full Signature Name</label>
              <input
                type="text"
                value={data.declaration?.signature || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    declaration: {
                      ...(prev.declaration || { title: 'DECLARATION' }),
                      signature: e.target.value
                    }
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* TAB 8: PDF EXPORT */}
        {activeTab === 'pdf' && (
          <div className="cv-form-section">
            <h3 className="cv-form-heading">PDF Export</h3>
            <div className="cv-field">
              <label>File Name</label>
              <input
                type="text"
                value={data.pdfFileName || ''}
                placeholder={buildPdfFileName('', data.header.fullName).replace(/\.pdf$/, '')}
                onChange={(e) => setData((prev) => ({ ...prev, pdfFileName: e.target.value }))}
              />
              <p className="cv-help-text">
                Downloads as <strong>{buildPdfFileName(data.pdfFileName, data.header.fullName)}</strong>
              </p>
            </div>

            <div className="cv-field">
              <label>PDF Type</label>
              <div className="cv-choice-list">
                {[
                  {
                    value: 'vector',
                    title: 'Real PDF (recommended)',
                    desc: 'True text that stays sharp at any zoom, best for recruiter systems. About 0.45 MB. Opens the print window: choose "Save as PDF".'
                  },
                  {
                    value: 'image',
                    title: 'Picture PDF',
                    desc: 'Downloads directly, no print window. Each page is an image with hidden readable text.'
                  }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`cv-choice ${pdfMode === opt.value ? 'active' : ''}`}
                    onClick={() => setPdfMode(opt.value)}
                  >
                    <span className="cv-choice-title">{opt.title}</span>
                    <span className="cv-choice-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {pdfMode === 'image' && (
              <div className="cv-field">
                <label>Picture Quality</label>
                <div className="cv-choice-list">
                  {[
                    { value: 'high', title: 'High quality', desc: 'Sharpest text and original photo. About 1.3 MB.' },
                    { value: 'small', title: 'Smaller file', desc: 'For email or job sites with upload limits. About 0.5 MB.' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={`cv-choice ${pdfQuality === opt.value ? 'active' : ''}`}
                      onClick={() => setPdfQuality(opt.value)}
                    >
                      <span className="cv-choice-title">{opt.title}</span>
                      <span className="cv-choice-desc">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pdfMode === 'vector' && (
              <p className="cv-help-text">
                In the print window: set <strong>Destination → Save as PDF</strong>. If you see headers
                and footers (date, page URL), open <strong>More settings</strong> and untick
                <strong> Headers and footers</strong>.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="cv-editor-mobile-footer mobile-only">
        <button className="cv-mobile-save-preview-btn" onClick={onClose}>
          <Check size={16} />
          <span>Save & View Resume</span>
        </button>
      </div>
    </aside>
  );
}

export default memo(ResumeEditor);
