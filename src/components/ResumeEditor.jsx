import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';

export default function ResumeEditor({ data, setData, isOpen, onClose }) {
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

  // Experience editor
  const updateExp = (expIdx, field, val) => {
    setData((prev) => {
      const newExps = [...prev.experiences];
      newExps[expIdx] = { ...newExps[expIdx], [field]: val };
      return { ...prev, experiences: newExps };
    });
  };

  const updateSubgroupHeading = (expIdx, secIdx, heading) => {
    setData((prev) => {
      const newExps = [...prev.experiences];
      newExps[expIdx].sections[secIdx].heading = heading;
      return { ...prev, experiences: newExps };
    });
  };

  const updateExpItem = (expIdx, secIdx, itemIdx, field, val) => {
    setData((prev) => {
      const newExps = [...prev.experiences];
      newExps[expIdx].sections[secIdx].items[itemIdx][field] = val;
      return { ...prev, experiences: newExps };
    });
  };

  const addExpItem = (expIdx, secIdx) => {
    setData((prev) => {
      const newExps = [...prev.experiences];
      newExps[expIdx].sections[secIdx].items.push({
        label: 'Feature / Responsibility',
        text: 'Detailed description of achievements and tasks.'
      });
      return { ...prev, experiences: newExps };
    });
  };

  const removeExpItem = (expIdx, secIdx, itemIdx) => {
    setData((prev) => {
      const newExps = [...prev.experiences];
      newExps[expIdx].sections[secIdx].items = newExps[expIdx].sections[
        secIdx
      ].items.filter((_, i) => i !== itemIdx);
      return { ...prev, experiences: newExps };
    });
  };

  const addSubgroup = (expIdx) => {
    setData((prev) => {
      const newExps = [...prev.experiences];
      newExps[expIdx].sections.push({
        heading: 'New Category',
        items: [{ label: 'Item Name', text: 'Specification or description.' }]
      });
      return { ...prev, experiences: newExps };
    });
  };

  const removeSubgroup = (expIdx, secIdx) => {
    setData((prev) => {
      const newExps = [...prev.experiences];
      newExps[expIdx].sections = newExps[expIdx].sections.filter(
        (_, i) => i !== secIdx
      );
      return { ...prev, experiences: newExps };
    });
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
        <button className="cv-close-btn" onClick={onClose} title="Close drawer">
          <X size={18} />
        </button>
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

            <div className="cv-subfield-section">
              <div className="cv-subfield-header">
                <label>Contact Details List</label>
                <button className="cv-mini-add-btn" onClick={addContact}>
                  <Plus size={13} /> Add Item
                </button>
              </div>

              {data.header.contacts.map((contact, i) => (
                <div key={i} className="cv-contact-edit-row">
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
            <h3 className="cv-form-heading">Skills & Knowledge (3 Columns)</h3>
            <p className="cv-help-text">
              Organized into 3 balanced columns matching the reference layout.
            </p>
            {data.skills.columns.map((col, colIdx) => (
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
            ))}
          </div>
        )}

        {/* TAB 4: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="cv-form-section">
            <h3 className="cv-form-heading">Professional Experience</h3>
            {data.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="cv-exp-card">
                <div className="cv-exp-card-header">
                  <h4>Experience #{expIdx + 1}</h4>
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

              {data.education.highlights.map((h, i) => (
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
      </div>
    </aside>
  );
}
